/**
 * Validation Utilities
 * Helper functions for form and data validation
 */

import { VALIDATION_RULES } from '../constants/app.constants';

export const ValidationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password) => {
    return password && password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
  },

  /**
   * Validate phone number
   */
  isValidPhone: (phone) => {
    return VALIDATION_RULES.PHONE_REGEX.test(phone);
  },

  /**
   * Validate required field
   */
  isRequired: (value) => {
    return value && value.toString().trim().length > 0;
  },

  /**
   * Validate min length
   */
  minLength: (value, length) => {
    return value && value.toString().length >= length;
  },

  /**
   * Validate max length
   */
  maxLength: (value, length) => {
    return value && value.toString().length <= length;
  },

  /**
   * Validate URL format
   */
  isValidURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput: (input) => {
    return input
      .toString()
      .trim()
      .replace(/[<>]/g, '');
  },
};

export default ValidationUtils;
