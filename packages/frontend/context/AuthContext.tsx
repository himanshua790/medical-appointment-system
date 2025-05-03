"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, logout, apiCall } from '../utils/api';
import { IUser } from '@medical/shared/types';

// Define the shape of our context
interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const storedUser = getUser();
      const token = getToken();

      if (storedUser && token) {
        setUser(storedUser);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const loginUser = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    try {
      const response = await apiCall('/auth/login', 'POST', { email, password }, false);
      
      // Store token in localStorage or sessionStorage based on rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.token);
      storage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const registerUser = async (userData: any) => {
    setLoading(true);
    try {
      await apiCall('/auth/register', 'POST', userData, false);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logoutUser = () => {
    logout();
    setUser(null);
    router.push('/auth');
  };

  // Create context value
  const value = {
    user,
    loading,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 