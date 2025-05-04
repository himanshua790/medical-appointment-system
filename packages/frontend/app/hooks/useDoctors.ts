import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as doctorService from '../services/doctorService';

// Query keys
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: any) => [...doctorKeys.lists(), { filters }] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  availability: (id: string, date: string) =>
    [...doctorKeys.detail(id), 'availability', date] as const,
};

// Get all doctors
export const useGetDoctors = (filters: { specialty?: string } = {}) => {
  return useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => doctorService.getAllDoctors(filters.specialty),
    select: (data) => data?.data || [],
  });
};

// Get doctor by ID
export const useGetDoctor = (id: string) => {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorService.getDoctorById(id),
    select: (data) => data?.data,
    enabled: !!id,
  });
};

// Get doctor availability
export const useGetDoctorAvailability = (id: string, date: string) => {
  return useQuery({
    queryKey: doctorKeys.availability(id, date),
    queryFn: () => doctorService.getDoctorAvailability(id, date),
    select: (data) => data?.data || [],
    enabled: !!id && !!date,
  });
};

// Create doctor
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorData: any) => doctorService.createDoctor(doctorData),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
};

// Update doctor
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, doctorData }: { id: string; doctorData: any }) =>
      doctorService.updateDoctor(id, doctorData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
};

// Delete doctor
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => doctorService.deleteDoctor(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.removeQueries({ queryKey: doctorKeys.detail(id) });
    },
  });
};
