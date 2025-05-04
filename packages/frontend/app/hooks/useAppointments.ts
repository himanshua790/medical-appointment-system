import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as appointmentService from '../services/appointmentService';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: any) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

// Get all user appointments
export const useUserAppointments = () => {
  return useQuery(
    appointmentKeys.lists(),
    () => appointmentService.getUserAppointments(),
    {
      select: (data) => data.data || [],
    }
  );
};

// Get a single appointment by ID
export const useAppointmentById = (id: string) => {
  return useQuery(
    appointmentKeys.detail(id),
    () => appointmentService.getAppointmentById(id),
    {
      select: (data) => data.data,
      enabled: !!id,
    }
  );
};

// Create an appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (appointmentData: any) => appointmentService.createAppointment(appointmentData),
    {
      onSuccess: () => {
        // Invalidate and refetch appointments list
        queryClient.invalidateQueries(appointmentKeys.lists());
      },
    }
  );
};

// Update an appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => appointmentService.updateAppointment(id, data),
    {
      onSuccess: (_, variables) => {
        // Invalidate specific appointment and the lists
        queryClient.invalidateQueries(appointmentKeys.detail(variables.id));
        queryClient.invalidateQueries(appointmentKeys.lists());
      },
    }
  );
};

// Cancel an appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => appointmentService.cancelAppointment(id),
    {
      onSuccess: (_, id) => {
        // Invalidate specific appointment and the lists
        queryClient.invalidateQueries(appointmentKeys.detail(id));
        queryClient.invalidateQueries(appointmentKeys.lists());
      },
    }
  );
};

// Reschedule an appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, newDateTime }: { id: string; newDateTime: string }) => 
      appointmentService.rescheduleAppointment(id, newDateTime),
    {
      onSuccess: (_, variables) => {
        // Invalidate specific appointment and the lists
        queryClient.invalidateQueries(appointmentKeys.detail(variables.id));
        queryClient.invalidateQueries(appointmentKeys.lists());
      },
    }
  );
}; 