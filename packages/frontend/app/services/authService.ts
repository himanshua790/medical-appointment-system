import { apiCall } from '../../utils/api';
// API base URL from environment or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * User login
 */
export const login = async (credentials: { email: string; password: string }) => {
  return apiCall(API_BASE_URL + '/auth/login', 'POST', credentials, false);
};

/**
 * User registration
 */
export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  role?: string;
}) => {
  return apiCall(API_BASE_URL + '/auth/register', 'POST', userData, false);
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return apiCall(API_BASE_URL + '/auth/me', 'GET');
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: any) => {
  return apiCall(API_BASE_URL + '/auth/profile', 'PUT', profileData);
};

/**
 * Change password
 */
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  return apiCall(API_BASE_URL + '/auth/password', 'PUT', passwordData);
};
