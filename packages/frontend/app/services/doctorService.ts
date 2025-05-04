import { apiCall } from '../../utils/api';

/**
 * Get all doctors with optional specialty filter
 */
export const getAllDoctors = async (specialty?: string) => {
  const endpoint = specialty 
    ? `/doctors?specialty=${encodeURIComponent(specialty)}`
    : '/doctors';
  
  return apiCall(endpoint, 'GET');
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (id: string) => {
  return apiCall(`/doctors/${id}`, 'GET');
};

/**
 * Get doctor availability for a specific date
 */
export const getDoctorAvailability = async (id: string, date: string) => {
  return apiCall(`/doctors/${id}/availability?date=${encodeURIComponent(date)}`, 'GET');
};

/**
 * Create a new doctor profile
 */
export const createDoctor = async (doctorData: any) => {
  return apiCall('/doctors', 'POST', doctorData);
};

/**
 * Update doctor profile
 */
export const updateDoctor = async (id: string, doctorData: any) => {
  return apiCall(`/doctors/${id}`, 'PUT', doctorData);
};

/**
 * Delete doctor profile
 */
export const deleteDoctor = async (id: string) => {
  return apiCall(`/doctors/${id}`, 'DELETE');
}; 