'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLogin, useRegister, useCurrentUser } from '../app/hooks/useAuth';
import { getToken, getUser, logout as logoutUtil } from '../utils/api';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import { IUser } from '@medical/shared/types';

interface User extends IUser {
  _id: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query hooks
  const { mutateAsync: loginMutation } = useLogin();
  const { mutateAsync: registerMutation } = useRegister();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const storedUser = getUser();

      if (token && storedUser) {
        setUser(storedUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Update user when React Query data changes
  useEffect(() => {
    if (currentUser && !isLoadingUser) {
      console.log('currentUser', currentUser);
      setUser(currentUser);
    }
  }, [currentUser, isLoadingUser]);

  const loginHandler = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password });

      if (response && response.data) {
        console.log('set user response', response);
        setUser(response.data.user);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error?.response?.data?.message || error);
      throw error;
    }
  };

  const registerHandler = async (userData: any) => {
    try {
      const response = await registerMutation(userData);

      if (response && response.data) {
        console.log('set user response2', response);
        setUser(response.data.user);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logoutHandler = () => {
    logoutUtil();
    setUser(null);

    // Clear all query cache
    queryClient.clear();

    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isLoading || isLoadingUser,
        login: loginHandler,
        register: registerHandler,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
