import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as doctorService from '../services/doctorService';

// Query keys
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: any) => [...doctorKeys.lists(), { filters }] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  availability: (id: string, date: string) => [...doctorKeys.detail(id), 'availability', date] as const,
};

// Get all doctors with optional filtering
export const useAllDoctors = (specialty?: string) => {
  return useQuery(
    doctorKeys.list({ specialty }),
    () => doctorService.getAllDoctors(specialty),
    {
      select: (data) => data.data || [],
    }
  );
};

// Get a single doctor by ID
export const useDoctorById = (id: string) => {
  return useQuery(
    doctorKeys.detail(id),
    () => doctorService.getDoctorById(id),
    {
      select: (data) => data.data,
      enabled: !!id,
    }
  );
};

// Get doctor availability for a specific date
export const useDoctorAvailability = (id: string, date: string) => {
  return useQuery(
    doctorKeys.availability(id, date),
    () => doctorService.getDoctorAvailability(id, date),
    {
      select: (data) => data.data || [],
      enabled: !!id && !!date,
    }
  );
};

// Create a doctor
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (doctorData: any) => doctorService.createDoctor(doctorData),
    {
      onSuccess: () => {
        // Invalidate and refetch doctors list
        queryClient.invalidateQueries(doctorKeys.lists());
      },
    }
  );
};

// Update a doctor
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => doctorService.updateDoctor(id, data),
    {
      onSuccess: (_, variables) => {
        // Invalidate specific doctor and the lists
        queryClient.invalidateQueries(doctorKeys.detail(variables.id));
        queryClient.invalidateQueries(doctorKeys.lists());
      },
    }
  );
};

// Delete a doctor
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => doctorService.deleteDoctor(id),
    {
      onSuccess: (_, id) => {
        // Invalidate the lists and remove this doctor from the cache
        queryClient.invalidateQueries(doctorKeys.lists());
        queryClient.removeQueries(doctorKeys.detail(id));
      },
    }
  );
}; 