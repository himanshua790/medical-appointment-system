import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as appointmentService from '../services/appointmentService';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: any) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

// Get all appointments
export const useGetAppointments = (filters = {}) => {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentService.getUserAppointments(),
    select: (data) => data?.data || [],
    staleTime: 0,
  });
};

// Get appointment by ID
export const useGetAppointment = (id: string) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getAppointmentById(id),
    select: (data) => data?.data,
    enabled: !!id,
  });
};

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData: any) => appointmentService.createAppointment(appointmentData),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

// Update appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, appointmentData }: { id: string; appointmentData: any }) =>
      appointmentService.updateAppointment(id, appointmentData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

// Delete appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) });
    },
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

// Reschedule appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDateTime }: { id: string; newDateTime: string }) =>
      appointmentService.rescheduleAppointment(id, newDateTime),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};
