import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance for profile API
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Don't treat 404 as an error - we'll handle it gracefully
  validateStatus: function (status) {
    // Return true for all status codes < 500 (including 404)
    // This prevents axios from throwing errors for 404s
    return status < 500;
  }
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 404 responses gracefully
api.interceptors.response.use(
  (response) => {
    // If it's a 404 on a profile GET endpoint, mark it as expected
    if (response.status === 404 && 
        response.config?.url?.includes('/profiles/') &&
        response.config?.method === 'get') {
      response.isExpected404 = true;
    }
    return response;
  },
  (error) => {
    // This shouldn't be called for 404s due to validateStatus, but handle just in case
    return Promise.reject(error);
  }
);

/**
 * ==================== JOB SEEKER PROFILE FUNCTIONS ====================
 */

/**
 * Create or update job seeker profile
 * @param {string} userId - Firebase user ID
 * @param {Object} profileData - Job seeker profile data
 * @returns {Promise<Object>} - Updated profile data
 */
export const createJobSeekerProfile = async (userId, profileData) => {
  try {
    const { data } = await api.post(`/profiles/jobseeker/${userId}`, profileData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Get job seeker profile
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} - Job seeker profile data
 */
export const getJobSeekerProfile = async (userId) => {
  try {
    // Guard against undefined userId
    if (!userId) {
      console.warn('getJobSeekerProfile: userId is undefined');
      return null;
    }
    
    const response = await api.get(`/profiles/jobseeker/${userId}`);
    // Handle 404 gracefully - profile doesn't exist yet
    if (response.status === 404 || response.isExpected404 || !response.data) {
      return null;
    }
    return response.data;
  } catch (error) {
    // Handle 404 gracefully - profile doesn't exist yet
    if (error.response?.status === 404 || error.isExpected404) {
      return null;
    }
    // Only throw for real errors
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Update job seeker profile
 * @param {string} userId - Firebase user ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} - Updated profile data
 */
export const updateJobSeekerProfile = async (userId, updateData) => {
  try {
    const { data } = await api.put(`/profiles/jobseeker/${userId}`, updateData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Delete job seeker profile
 * @param {string} userId - Firebase user ID
 * @returns {Promise<void>}
 */
export const deleteJobSeekerProfile = async (userId) => {
  try {
    await api.delete(`/profiles/jobseeker/${userId}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * ==================== EMPLOYER PROFILE FUNCTIONS ====================
 */

/**
 * Create or update employer profile
 * @param {string} userId - Firebase user ID
 * @param {Object} profileData - Employer profile data
 * @returns {Promise<Object>} - Updated profile data
 */
export const createEmployerProfile = async (userId, profileData) => {
  try {
    const { data } = await api.post(`/profiles/employer/${userId}`, profileData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Get employer profile
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} - Employer profile data
 */
export const getEmployerProfile = async (userId) => {
  try {
    // Guard against undefined userId
    if (!userId) {
      console.warn('getEmployerProfile: userId is undefined');
      return null;
    }
    
    const response = await api.get(`/profiles/employer/${userId}`);
    // Handle 404 gracefully - profile doesn't exist yet
    if (response.status === 404 || response.isExpected404 || !response.data) {
      return null;
    }
    return response.data;
  } catch (error) {
    // Handle 404 gracefully - profile doesn't exist yet
    if (error.response?.status === 404 || error.isExpected404) {
      return null;
    }
    // Only throw for real errors
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Update employer profile
 * @param {string} userId - Firebase user ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} - Updated profile data
 */
export const updateEmployerProfile = async (userId, updateData) => {
  try {
    const { data } = await api.put(`/profiles/employer/${userId}`, updateData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Delete employer profile
 * @param {string} userId - Firebase user ID
 * @returns {Promise<void>}
 */
export const deleteEmployerProfile = async (userId) => {
  try {
    await api.delete(`/profiles/employer/${userId}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * ==================== RESUME MANAGEMENT FUNCTIONS ====================
 */

/**
 * Upload resume file
 * @param {string} userId - Firebase user ID
 * @param {File} file - Resume file to upload
 * @returns {Promise<Object>} - {resumeUrl, fileName}
 */
export const uploadResume = async (userId, file) => {
  try {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) throw new Error('Only PDF and Word documents are allowed');
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) throw new Error('File size must not exceed 5MB');

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post(`/profiles/jobseeker/${userId}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Update profile on success
    await updateJobSeekerProfile(userId, {
      resumeUrl: data.resumeUrl,
      resumeFileName: data.fileName,
    });

    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Delete resume file
 * @param {string} userId - Firebase user ID
 * @param {string} fileName - Name of the file to delete
 * @returns {Promise<void>}
 */
export const deleteResume = async (userId, fileName) => {
  try {
    await api.delete(`/profiles/jobseeker/${userId}/resume/${encodeURIComponent(fileName)}`);
    await updateJobSeekerProfile(userId, { resumeUrl: '', resumeFileName: '' });
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * ==================== SEARCH & QUERY FUNCTIONS ====================
 */

/**
 * Search job seekers by skills or location
 * @param {Object} filters - {skills: [], city: '', minExp: number}
 * @returns {Promise<Array>} - Array of matching job seekers
 */
export const searchJobSeekers = async (filters = {}) => {
  try {
    const { data } = await api.get('/profiles/jobseekers', { params: filters });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Search employers by company name or industry
 * @param {Object} filters - {industry: '', companyName: ''}
 * @returns {Promise<Array>} - Array of matching employers
 */
export const searchEmployers = async (filters = {}) => {
  try {
    const { data } = await api.get('/profiles/employers', { params: filters });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Get all job seekers (paginated)
 * @param {number} limit - Number of records to fetch
 * @param {Object} lastDoc - Last document for pagination
 * @returns {Promise<Array>} - Array of job seeker profiles
 */
export const getAllJobSeekers = async (limit = 10, lastDoc = null) => {
  try {
    const { data } = await api.get('/profiles/jobseekers', { params: { limit } });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Get all employers (paginated)
 * @param {number} limit - Number of records to fetch
 * @param {Object} lastDoc - Last document for pagination
 * @returns {Promise<Array>} - Array of employer profiles
 */
export const getAllEmployers = async (limit = 10, lastDoc = null) => {
  try {
    const { data } = await api.get('/profiles/employers', { params: { limit } });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};
