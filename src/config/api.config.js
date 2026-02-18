/**
 * API Configuration
 * Centralized API endpoint and base URL configuration
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },

  // Jobs
  JOBS: {
    GET_ALL: '/jobs',
    GET_BY_ID: (id) => `/jobs/${id}`,
    CREATE: '/jobs',
    UPDATE: (id) => `/jobs/${id}`,
    DELETE: (id) => `/jobs/${id}`,
    GET_EMPLOYER_JOBS: (employerId) => `/jobs/employer/${employerId}`,
    APPLY: (jobId) => `/jobs/${jobId}/apply`,
    GET_APPLICATIONS: (jobId) => `/jobs/${jobId}/applications`,
  },

  // Profiles
  PROFILES: {
    JOB_SEEKER: {
      GET: (userId) => `/profiles/jobseeker/${userId}`,
      CREATE: (userId) => `/profiles/jobseeker/${userId}`,
      UPDATE: (userId) => `/profiles/jobseeker/${userId}`,
      DELETE: (userId) => `/profiles/jobseeker/${userId}`,
    },
    EMPLOYER: {
      GET: (userId) => `/profiles/employer/${userId}`,
      CREATE: (userId) => `/profiles/employer/${userId}`,
      UPDATE: (userId) => `/profiles/employer/${userId}`,
      DELETE: (userId) => `/profiles/employer/${userId}`,
    },
  },
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
