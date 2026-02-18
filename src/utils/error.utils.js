/**
 * Error Utilities
 * Helper functions for error handling
 */

export const ErrorUtils = {
  /**
   * Get error message from API response
   */
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  /**
   * Get HTTP status code
   */
  getStatusCode: (error) => {
    return error.response?.status || 500;
  },

  /**
   * Check if error is authentication related
   */
  isAuthError: (error) => {
    const status = ErrorUtils.getStatusCode(error);
    return status === 401 || status === 403;
  },

  /**
   * Check if error is validation related
   */
  isValidationError: (error) => {
    return ErrorUtils.getStatusCode(error) === 400;
  },

  /**
   * Format error object for logging
   */
  formatErrorLog: (error, context = '') => {
    return {
      timestamp: new Date().toISOString(),
      context,
      message: ErrorUtils.getErrorMessage(error),
      status: ErrorUtils.getStatusCode(error),
      details: error.response?.data || error.message,
    };
  },

  /**
   * Handle API errors uniformly
   */
  handleError: (error, callback = null) => {
    const errorMessage = ErrorUtils.getErrorMessage(error);
    const statusCode = ErrorUtils.getStatusCode(error);

    console.error('API Error:', {
      status: statusCode,
      message: errorMessage,
    });

    if (callback) {
      callback(errorMessage, statusCode);
    }

    return { message: errorMessage, status: statusCode };
  },
};

export default ErrorUtils;
