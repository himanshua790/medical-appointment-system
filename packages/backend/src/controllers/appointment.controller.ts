import { Request, Response, NextFunction } from 'express';
import Appointment from '../models/appointment.model';
import Doctor from '../models/doctor.model';
import { scheduleAppointmentReminder } from '../services/queue.service';

/**
 * Get all appointments (filtered by user if requested)
 */
export const getAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId, doctorId, status } = req.query;

    // Build filter based on query params
    const filter: any = {};

    if (patientId) {
      filter.patientId = patientId;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (status) {
      filter.status = status;
    }

    // If user is a patient, only show their appointments
    if (req.user && req.user.role === 'patient') {
      filter.patientId = req.user._id;
    }

    // If user is a doctor, only show their appointments
    if (req.user && req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'username email')
      .populate('doctorId', 'name specialty');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    next({
      error,
      message: 'An error occurred while fetching appointments',
      status: 500,
    });
  }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'username email')
      .populate('doctorId', 'name specialty');

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    if (
      req.user &&
      req.user.role !== 'admin' &&
      req.user.role === 'patient' &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    next({
      error,
      message: 'An error occurred while fetching appointment',
      status: 500,
    });
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId, doctorId, dateTime, endTime, reasonForVisit, notes } = req.body;

    // If user is a patient, use their ID
    const finalPatientId = req.user && req.user.role === 'patient' ? req.user._id : patientId;

    // Check if the user is a patient
    if (!finalPatientId) {
      res.status(400).json({
        success: false,
        message: 'Patient ID is required',
      });
      return;
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }

    // Validate appointment time (is it during doctor's working hours?)
    const appointmentDate = new Date(dateTime);
    const dayOfWeek = appointmentDate.getDay();

    const workingHours = doctor.workingHours.find((hours) => hours.dayOfWeek === dayOfWeek);
    if (!workingHours) {
      res.status(400).json({
        success: false,
        message: 'Doctor does not work on this day',
      });
      return;
    }

    // Check if time is within working hours
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    const workStart = new Date(appointmentDate);
    workStart.setHours(startHour, startMinute, 0, 0);

    const workEnd = new Date(appointmentDate);
    workEnd.setHours(endHour, endMinute, 0, 0);

    if (appointmentDate < workStart || appointmentDate > workEnd) {
      res.status(400).json({
        success: false,
        message: 'Appointment time is outside doctor working hours',
      });
      return;
    }

    // Check if doctor is unavailable at this time
    const unavailableTimes = doctor.unavailableTimes?.filter((time) => {
      const unavailableStart = new Date(time.startDateTime);
      const unavailableEnd = new Date(time.endDateTime);

      return (
        (appointmentDate >= unavailableStart && appointmentDate < unavailableEnd) ||
        (new Date(endTime) > unavailableStart && new Date(endTime) <= unavailableEnd)
      );
    });

    if (unavailableTimes && unavailableTimes.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Doctor is unavailable at this time',
      });
      return;
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          dateTime: { $lte: dateTime },
          endTime: { $gt: dateTime },
        },
        {
          dateTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          dateTime: { $gte: dateTime },
          endTime: { $lte: endTime },
        },
      ],
    });

    if (conflictingAppointment) {
      res.status(400).json({
        success: false,
        message: 'This time slot is already booked',
      });
      return;
    }

    // Set reminder time (24 hours before appointment)
    const reminderTime = new Date(appointmentDate);
    reminderTime.setDate(reminderTime.getDate() - 1);

    // Create appointment
    const appointment = new Appointment({
      patientId: finalPatientId,
      doctorId,
      dateTime: appointmentDate,
      endTime,
      reasonForVisit,
      notes,
      status: 'scheduled',
      reminderSent: false,
      reminderTime,
    });

    await appointment.save();

    // Schedule a reminder 30 minutes after creation
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    await scheduleAppointmentReminder(
      appointment._id.toString(),
      finalPatientId.toString(),
      appointment.toObject(),
      // THIRTY_MINUTES_MS
      10000
    );

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    next({
      error,
      message: 'An error occurred while creating appointment',
      status: 500,
    });
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { dateTime, endTime, reasonForVisit, status, notes } = req.body;

    // Find current appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    if (
      req.user &&
      req.user.role !== 'admin' &&
      req.user.role === 'patient' &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
      return;
    }

    // If date/time is changed, validate availability
    if (dateTime && dateTime !== appointment.dateTime.toString()) {
      const doctor = await Doctor.findById(appointment.doctorId);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
        return;
      }

      // Validate doctor availability as in createAppointment
      const appointmentDate = new Date(dateTime);
      const dayOfWeek = appointmentDate.getDay();

      const workingHours = doctor.workingHours.find((hours) => hours.dayOfWeek === dayOfWeek);
      if (!workingHours) {
        res.status(400).json({
          success: false,
          message: 'Doctor does not work on this day',
        });
        return;
      }

      // Check for conflicting appointments (excluding this one)
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: id },
        doctorId: appointment.doctorId,
        status: { $ne: 'cancelled' },
        $or: [
          {
            dateTime: { $lte: dateTime },
            endTime: { $gt: dateTime },
          },
          {
            dateTime: { $lt: endTime },
            endTime: { $gte: endTime },
          },
          {
            dateTime: { $gte: dateTime },
            endTime: { $lte: endTime },
          },
        ],
      });

      if (conflictingAppointment) {
        res.status(400).json({
          success: false,
          message: 'This time slot is already booked',
        });
        return;
      }

      // Update reminder time if dateTime changes
      if (dateTime) {
        const reminderTime = new Date(dateTime);
        reminderTime.setDate(reminderTime.getDate() - 1);
        appointment.reminderTime = reminderTime;
        appointment.reminderSent = false;
      }
    }

    // Update fields
    if (dateTime) appointment.dateTime = new Date(dateTime);
    if (endTime) appointment.endTime = new Date(endTime);
    if (reasonForVisit) appointment.reasonForVisit = reasonForVisit;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    next({
      error,
      message: 'An error occurred while updating appointment',
      status: 500,
    });
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    if (
      req.user &&
      req.user.role !== 'admin' &&
      req.user.role === 'patient' &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment',
      });
      return;
    }

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    next({
      error,
      message: 'An error occurred while deleting appointment',
      status: 500,
    });
  }
};
