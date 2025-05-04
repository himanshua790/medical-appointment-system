import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as authService from '../services/authService';
import { IDoctor, IUser } from '@medical/shared/types';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
};

// Get current user profile
export const useCurrentUser = () => {
  return useQuery(authKeys.user, () => authService.getCurrentUser(), {
    retry: false,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
    onError: () => {
      // If we get an error, it's likely because the user is not authenticated
      // We can handle this by not doing anything special here
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

  return useMutation((userData: IUser| IDoctor) => authService.register(userData), {
    onSuccess: (data) => {
      console.log('query data ', data);
      // Update the user in the cache
      queryClient.setQueryData(authKeys.user, { data: data.user });
      // persist registered user in localStorage
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
