import { Request, Response, NextFunction } from 'express';
import Doctor from '../models/doctor.model';
import Appointment from '../models/appointment.model';
import { ITimeSlot } from '@medical/shared/types';

/**
 * Get all doctors
 */
export const getAllDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { specialty } = req.query;
    
    // Build filter based on query params
    const filter: any = {};
    if (specialty) {
      filter.specialty = specialty;
    }
    
    const doctors = await Doctor.find(filter).populate('userId', 'username email');
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    next({
      error,
      message: 'An error occurred while fetching doctors',
      status: 500,
    });
  }
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id).populate('userId', 'username email');
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    next({
      error,
      message: 'An error occurred while fetching doctor',
      status: 500,
    });
  }
};

/**
 * Create new doctor profile
 */
export const createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, name, specialty, bio, workingHours } = req.body;
    
    // Check if doctor already exists with this userId
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      res.status(400).json({
        success: false,
        message: 'Doctor profile already exists for this user',
      });
      return;
    }
    
    const doctor = new Doctor({
      userId,
      name,
      specialty,
      bio,
      workingHours,
    });
    
    await doctor.save();
    
    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    next({
      error,
      message: 'An error occurred while creating doctor profile',
      status: 500,
    });
  }
};

/**
 * Update doctor profile
 */
export const updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, specialty, bio, workingHours, unavailableTimes } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { name, specialty, bio, workingHours, unavailableTimes },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    next({
      error,
      message: 'An error occurred while updating doctor profile',
      status: 500,
    });
  }
};

/**
 * Delete doctor profile
 */
export const deleteDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findByIdAndDelete(id);
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }
    
    // Also delete all related appointments
    await Appointment.deleteMany({ doctorId: id });
    
    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    next({
      error,
      message: 'An error occurred while deleting doctor profile',
      status: 500,
    });
  }
};

/**
 * Get doctor availability (time slots)
 */
export const getDoctorAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)',
      });
      return;
    }
    
    // Find doctor
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }
    
    // Parse the requested date
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay(); // 0 is Sunday
    
    // Find doctor's working hours for the requested day
    const dayWorkingHours = doctor.workingHours.find(
      hours => hours.dayOfWeek === dayOfWeek
    );
    
    if (!dayWorkingHours) {
      res.status(200).json({
        success: true,
        message: 'Doctor does not work on this day',
        data: [],
      });
      return;
    }
    
    // Parse working hours
    const [startHour, startMinute] = dayWorkingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayWorkingHours.endTime.split(':').map(Number);
    
    // Set start and end times for the requested date
    const startTime = new Date(requestedDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(requestedDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Find unavailable times for the doctor on the requested date
    const unavailableTimes = doctor.unavailableTimes?.filter(time => {
      const startDate = new Date(time.startDateTime);
      const endDate = new Date(time.endDateTime);
      
      return (
        startDate.getFullYear() === requestedDate.getFullYear() &&
        startDate.getMonth() === requestedDate.getMonth() &&
        startDate.getDate() === requestedDate.getDate()
      );
    });
    
    // Find existing appointments for the doctor on the requested date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const appointments = await Appointment.find({
      doctorId: id,
      dateTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    });
    
    // Generate time slots (30-minute intervals)
    const slots: ITimeSlot[] = [];
    const slotDuration = 30; // minutes
    
    for (
      let slotStart = new Date(startTime);
      slotStart < endTime;
      slotStart = new Date(slotStart.getTime() + slotDuration * 60000)
    ) {
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
      
      // Check if slot is within working hours
      if (slotEnd > endTime) {
        continue;
      }
      
      // Default to available
      let isAvailable = true;
      
      // Check if slot overlaps with any unavailable time
      if (unavailableTimes?.length) {
        for (const unavailable of unavailableTimes) {
          const unavailableStart = new Date(unavailable.startDateTime);
          const unavailableEnd = new Date(unavailable.endDateTime);
          
          if (
            (slotStart >= unavailableStart && slotStart < unavailableEnd) ||
            (slotEnd > unavailableStart && slotEnd <= unavailableEnd) ||
            (slotStart <= unavailableStart && slotEnd >= unavailableEnd)
          ) {
            isAvailable = false;
            break;
          }
        }
      }
      
      // Check if slot overlaps with any existing appointment
      if (isAvailable && appointments.length) {
        for (const appointment of appointments) {
          const appointmentStart = new Date(appointment.dateTime);
          const appointmentEnd = new Date(appointment.endTime);
          
          if (
            (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
          ) {
            isAvailable = false;
            break;
          }
        }
      }
      
      slots.push({
        start: new Date(slotStart),
        end: new Date(slotEnd),
        isAvailable,
      });
    }
    
    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error('Error getting doctor availability:', error);
    next({
      error,
      message: 'An error occurred while fetching doctor availability',
      status: 500,
    });
  }
}; 