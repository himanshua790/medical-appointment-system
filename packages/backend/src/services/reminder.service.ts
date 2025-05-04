import Appointment from '../models/appointment.model';
import Doctor from '../models/doctor.model';
import User from '../models/user.model';
import { reminderQueue } from './queue.service';

/**
 * Service for handling appointment reminders
 */
export class ReminderService {
  /**
   * Find appointments that need reminders to be sent
   */
  static async findPendingReminders(): Promise<any[]> {
    const now = new Date();
    
    // Find appointments where:
    // 1. Reminder hasn't been sent yet
    // 2. Reminder time is in the past
    // 3. Appointment status is 'scheduled'
    return Appointment.find({
      reminderSent: false,
      reminderTime: { $lte: now },
      status: 'scheduled',
    })
      .populate('patientId', 'email username')
      .populate('doctorId');
  }
  
  /**
   * Process pending reminders
   */
  static async processReminders(): Promise<void> {
    try {
      const pendingReminders = await this.findPendingReminders();
      
      console.log(`Processing ${pendingReminders.length} appointment reminders`);
      
      for (const appointment of pendingReminders) {
        await this.sendReminderForAppointment(appointment);
        
        // Mark reminder as sent
        appointment.reminderSent = true;
        await appointment.save();
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }
  
  /**
   * Send reminder for a specific appointment
   * This is a placeholder for actual email/SMS implementation
   */
  static async sendReminderForAppointment(appointment: any): Promise<void> {
    try {
      const patient = appointment.patientId;
      const doctor = await Doctor.findById(appointment.doctorId).populate('userId', 'email');
      
      if (!patient || !doctor) {
        console.error(`Missing patient or doctor for appointment ${appointment._id}`);
        return;
      }
      
      const appointmentDate = new Date(appointment.dateTime);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = appointmentDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Log the reminder (in production, this would send an email or SMS)
      console.log(`
        === APPOINTMENT REMINDER ===
        To: ${patient.username} (${patient.email})
        Subject: Reminder for your appointment on ${formattedDate}
        
        Dear ${patient.username},
        
        This is a reminder for your appointment with Dr. ${doctor.name}
        on ${formattedDate} at ${formattedTime}.
        
        Reason for visit: ${appointment.reasonForVisit}
        
        Please arrive 15 minutes before your scheduled time.
        If you need to cancel or reschedule, please do so at least 24 hours in advance.
        
        Thank you,
        Medical Appointment System
      `);
      
      // TODO: Implement actual email sending using a service like Nodemailer
    } catch (error) {
      console.error(`Error sending reminder for appointment ${appointment._id}:`, error);
    }
  }
  
  /**
   * Schedule periodic checking for reminders
   */
  static startReminderCron(intervalMinutes = 15): NodeJS.Timeout {
    console.log(`Starting reminder service, checking every ${intervalMinutes} minutes`);
    
    // Process immediately on startup
    this.processReminders();
    
    // Schedule periodic checks
    return setInterval(() => {
      this.processReminders();
    }, intervalMinutes * 60 * 1000);
  }
}

// Process reminder jobs
export const initializeReminderProcessor = (): void => {
  reminderQueue.process(async (job) => {
    const { appointmentId, userId, appointmentDetails } = job.data;
    
    try {
      // Check if the appointment still exists and is not cancelled
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        status: 'scheduled', // Only remind for scheduled appointments
      });
      
      if (!appointment) {
        console.log(`Appointment ${appointmentId} no longer active, skipping reminder`);
        return;
      }
      
      // Check if the user is still valid
      const user = await User.findById(userId);
      if (!user) {
        console.log(`User ${userId} not found, skipping reminder`);
        return;
      }
      
      // Get doctor details for the reminder
      const doctor = await Doctor.findById(appointment.doctorId);
      if (!doctor) {
        console.log(`Doctor for appointment ${appointmentId} not found`);
        return;
      }
      
      // Check if user is logged in - we'll verify by checking active tokens
      // This is a simplified check and would need to be replaced with your actual
      // user session management logic
      const isUserLoggedIn = await checkIfUserIsLoggedIn(userId);
      
      if (isUserLoggedIn) {
        // Display reminder with all details
        console.log('========== APPOINTMENT REMINDER ==========');
        console.log(`Reminder for user: ${user.username} (${user.email})`);
        console.log(`Appointment with: Dr. ${doctor.name} (${doctor.specialty})`);
        console.log(`Date/Time: ${appointment.dateTime.toLocaleString()}`);
        console.log(`Reason for visit: ${appointment.reasonForVisit}`);
        console.log(`Notes: ${appointment.notes || 'None'}`);
        console.log('==========================================');
        
        // Mark reminder as sent
        await Appointment.findByIdAndUpdate(appointmentId, { reminderSent: true });
      } else {
        console.log(`User ${userId} is not logged in, skipping reminder display`);
      }
    } catch (error) {
      console.error(`Error processing reminder for appointment ${appointmentId}:`, error);
      throw error; // Rethrow to trigger Bull's retry mechanism
    }
  });
  
  console.log('Reminder processor initialized');
};

// Helper function to check if user is logged in
// This would need to be replaced with your actual session management logic
const checkIfUserIsLoggedIn = async (userId: string): Promise<boolean> => {
  try {
    // In a real application, you would check your session store or active tokens
    // For example:
    
    // Option 1: Check a Redis store for active sessions
    // const activeSession = await redisClient.get(`user-session:${userId}`);
    // return activeSession !== null;
    
    // Option 2: Check a database table for active sessions
    // const session = await Session.findOne({ userId, active: true });
    // return !!session;
    
    // Option 3: Use your JWT token store or session management system
    
    // For this example, we're simply returning true (user is logged in)
    // In a production app, replace this with actual session verification logic
    console.log(`Checking if user ${userId} is logged in...`);
    
    // To simulate a user not being logged in sometimes, you could add:
    // return Math.random() > 0.5; // 50% chance user is logged out
    
    return true;
  } catch (error) {
    console.error('Error checking user login status:', error);
    return false;
  }
};

export default ReminderService; 