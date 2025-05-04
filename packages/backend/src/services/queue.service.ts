import Queue from 'bull';
import { IAppointment } from '@medical/shared/types';

// Create queues
export const reminderQueue = new Queue<{
  appointmentId: string;
  userId: string;
  appointmentDetails: IAppointment;
}>('appointment-reminders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Add event listeners for monitoring
reminderQueue.on('completed', (job) => {
  console.log(`Reminder job ${job.id} completed for appointment ${job.data.appointmentId}`);
});

reminderQueue.on('failed', (job, err) => {
  console.error(`Reminder job ${job?.id} failed for appointment ${job?.data.appointmentId}:`, err);
});

// Helper function to schedule reminders
export const scheduleAppointmentReminder = async (
  appointmentId: string,
  userId: string,
  appointmentDetails: IAppointment,
  delayMs: number
): Promise<void> => {
  await reminderQueue.add(
    {
      appointmentId,
      userId,
      appointmentDetails,
    },
    {
      delay: delayMs,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60000, // 1 minute
      },
    }
  );
  console.log(`Reminder scheduled for appointment ${appointmentId} in ${delayMs}ms`);
}; 