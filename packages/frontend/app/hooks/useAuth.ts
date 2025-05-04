import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/authService';
import { IDoctor, IUser } from '@medical/shared/types';
import { getToken, getUser } from '../../utils/api';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
};

// Define response types
interface AuthResponse {
  user: IUser;
  token: string;
}

/**
 * Get current user profile
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    select: (data) => data?.data,
    queryFn: () => authService.getCurrentUser(),
    enabled: !!getToken(), // Only run if token exists
    retry: false,
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, { data: data.user });
      // set token acc to local storage
      localStorage.setItem('token', data.token);
      // persist user in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    onError: (error: unknown) => {
      console.log('query error ', error);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: IUser | IDoctor) => authService.register(userData),
    onSuccess: (data: AuthResponse) => {
      console.log('query data register ', data);
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, { data: data.user });
      // set token acc to local storage
      localStorage.setItem('token', data.token);
      // persist user in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    onError: (error: unknown) => {
      console.log('query error ', error);
    },
  });
};

// Update user profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: any) => authService.updateUserProfile(profileData),
    onSuccess: (data: any) => {
      // Update the profile and user in the cache
      queryClient.setQueryData(authKeys.user, { data: data });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(passwordData),
  });
};
