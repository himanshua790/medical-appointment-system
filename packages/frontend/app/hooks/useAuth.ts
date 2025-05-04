import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as authService from '../services/authService';
import { IDoctor, IUser } from '@medical/shared/types';
import { getToken, getUser } from '../../utils/api';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
};

/**
 * Get current user profile
 */
export const useCurrentUser = () => {
  // grab what's in localStorage
  const token = getToken();
  const storedUser = getUser();

  return useQuery(authKeys.user, () => authService.getCurrentUser(), {
    retry: false,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
    // seed cache with stored user if you have one
    initialData: storedUser ? { data: storedUser } : undefined,
    // only hit the API when you have a token but no stored user
    enabled: !!token && !storedUser,
    onError: () => {
      // silent fail if not actually authenticated
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (credentials: { email: string; password: string }) => authService.login(credentials),
    {
      onSuccess: (data) => {
        console.log('query data login ', data);
        // Update the user in the cache
        queryClient.setQueryData(authKeys.user, { data: data.user });
        // set token acc to local storage
        localStorage.setItem('token', data.token);
        // persist user in localStorage for session persistence
        localStorage.setItem('user', JSON.stringify(data.user));
      },
      onError: (error) => {
        console.log('query error login ', error);
      },
    }
  );
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation((userData: IUser | IDoctor) => authService.register(userData), {
    onSuccess: (data) => {
      console.log('query data register ', data);
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, { data: data.user });
      // set token acc to local storage
      localStorage.setItem('token', data.token);
      // persist user in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    onError: (error) => {
      console.log('query error ', error);
    },
  });
};

// Update user profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation((profileData: any) => authService.updateUserProfile(profileData), {
    onSuccess: (data) => {
      // Update the profile and user in the cache
      queryClient.setQueryData(authKeys.user, { data: data });
      queryClient.invalidateQueries(authKeys.profile);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation((passwordData: { currentPassword: string; newPassword: string }) =>
    authService.changePassword(passwordData)
  );
};
