/**
 * API Client
 * Centralized HTTP client with interceptors for API calls
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { StorageUtils } from '../utils/storage.utils';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = StorageUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      StorageUtils.clearAll();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiRequest = {
  /**
   * GET request
   */
  get: (url, config = {}) => apiClient.get(url, config),

  /**
   * POST request
   */
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

  /**
   * PUT request
   */
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

  /**
   * PATCH request
   */
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

  /**
   * DELETE request
   */
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default apiClient;
