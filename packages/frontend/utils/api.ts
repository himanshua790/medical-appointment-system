// API utility functions for frontend
import axios, { AxiosInstance, AxiosError } from 'axios';

// API base URL from environment or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get the authentication token from storage
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};

/**
 * Get the current user from storage
 */
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Log out the current user by clearing storage
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log("response ", response)
    return response.data
  },
  (error: AxiosError) => {
    console.log("error ", error)
    const message = error?.response?.data?.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

/**
 * Make an API call
 */
export const apiCall = async (
  endpoint: string,
  method: string = 'GET',
  body: any = null,
  requireAuth: boolean = true
) => {
  try {
    // If auth is not required, create a new instance without the auth header
    if (!requireAuth) {
      const config = {
        url: endpoint,
        method,
        data: body,
      };
      return await axios.request(config).then(response => response.data);
    }
    
    // Use the interceptor-configured instance for auth requests
    const config = {
      url: endpoint,
      method,
      data: body,
    };
    
    return await api.request(config);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('API request failed');
  }
}; 