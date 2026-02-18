/**
 * Application Constants
 * Global constants used throughout the application
 */

export const USER_TYPES = {
  JOB_SEEKER: 'jobseeker',
  EMPLOYER: 'employer',
};

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
];

export const WORK_MODES = [
  'On-site',
  'Remote',
  'Hybrid',
];

export const INDIAN_CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Nagpur',
  'Remote (India)',
];

export const JOB_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  PREFERENCES: 'preferences',
};

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^[0-9]{10}$/,
};

export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred. Please try again.',
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
};

const constants = {
  USER_TYPES,
  JOB_TYPES,
  WORK_MODES,
  INDIAN_CITIES,
  JOB_STATUS,
  APPLICATION_STATUS,
  STORAGE_KEYS,
  VALIDATION_RULES,
  MESSAGES,
};

export default constants;
