/**
 * Storage Utilities
 * Helper functions for localStorage operations
 */

import { STORAGE_KEYS } from '../constants/app.constants';

export const StorageUtils = {
  /**
   * Get token from localStorage
   */
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Set token in localStorage
   */
  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  },

  /**
   * Clear token from localStorage
   */
  clearToken: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Get user from localStorage
   */
  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Set user in localStorage
   */
  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  /**
   * Clear user from localStorage
   */
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Clear all app data
   */
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!StorageUtils.getToken();
  },
};

export default StorageUtils;
