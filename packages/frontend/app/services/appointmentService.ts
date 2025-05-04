import { apiCall } from '../../utils/api';

/**
 * Get all appointments for the current user
 */
export const getUserAppointments = async () => {
  return apiCall('/appointments', 'GET');
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (id: string) => {
  return apiCall(`/appointments/${id}`, 'GET');
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: any) => {
  return apiCall('/appointments', 'POST', appointmentData);
};

/**
 * Update an appointment
 */
export const updateAppointment = async (id: string, appointmentData: any) => {
  return apiCall(`/appointments/${id}`, 'PUT', appointmentData);
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (id: string) => {
  return apiCall(`/appointments/${id}/cancel`, 'POST');
};

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = async (id: string, newDateTime: string) => {
  return apiCall(`/appointments/${id}/reschedule`, 'POST', { newDateTime });
}; 