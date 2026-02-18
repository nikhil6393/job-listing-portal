// Job Service for MongoDB Backend
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Post a new job (Employers only)
export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

// Get all jobs (with optional filters)
export const getJobs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/jobs${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
  }
};

// Get a single job by ID
export const getJobById = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job details');
  }
};

// Update a job (Employers only - their own jobs)
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

// Delete a job (Employers only - their own jobs)
export const deleteJob = async (jobId) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

// Get jobs posted by employer
export const getEmployerJobs = async (employerId) => {
  try {
    const response = await api.get(`/jobs/employer/${employerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employer jobs');
  }
};

// Apply for a job (Job seekers only)
export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to apply for job');
  }
};

// Get applications for a job (Employers only - their own jobs)
export const getJobApplications = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

// Get user's applications (Job seekers only)
export const getUserApplications = async () => {
  try {
    const response = await api.get('/user/applications');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

// Get all applications for employer's jobs (Employers only)
export const getEmployerApplications = async () => {
  try {
    const response = await api.get('/employer/applications');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employer applications');
  }
};

// Update application status (Employers only)
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await api.put(`/applications/${applicationId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update application');
  }
};

// Get application stats (monthly counts for jobseeker)
export const getApplicationStats = async () => {
  try {
    const response = await api.get('/user/application-stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch application stats');
  }
};

// Get employer stats (monthly counts of received applications, interviews, rejections)
export const getEmployerStats = async () => {
  try {
    const response = await api.get('/employer/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employer stats');
  }
};
