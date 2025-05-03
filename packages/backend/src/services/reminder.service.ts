import Appointment from '../models/appointment.model';
import User from '../models/user.model';
import Doctor from '../models/doctor.model';

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

export default ReminderService; 