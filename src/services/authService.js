/**
 * MongoDB Authentication Service
 * This service communicates with the Express/MongoDB backend
 * instead of Firebase
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's full name
 * @param {string} userType - 'jobseeker' or 'employer'
 */
export const registerUser = async (email, password, displayName, userType) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        userType
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Store token in localStorage
    localStorage.setItem('token', data.token);

    return data.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Login user
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token in localStorage
    localStorage.setItem('token', data.token);

    return data.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get current user data from backend
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/auth/current-user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Token might be invalid, clear it
      localStorage.removeItem('token');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    // Clear token from localStorage
    localStorage.removeItem('token');

    // Optional: Notify backend
    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error(error.message);
  }
};

/**
 * Update user profile
 * @param {string} displayName - User's new display name
 */
export const updateUserProfile = async (displayName) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Profile update failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
