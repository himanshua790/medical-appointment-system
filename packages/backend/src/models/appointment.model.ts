import { Schema, model } from 'mongoose';
import { IAppointment } from '@medical/shared/types';

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dateTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reasonForVisit: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'], 
      default: 'scheduled',
      required: true
    },
    notes: { type: String },
    reminderSent: { type: Boolean, default: false },
    reminderTime: { type: Date, required: true },
  },
  { timestamps: true }
);

// Add indexes for better query performance
appointmentSchema.index({ patientId: 1, dateTime: 1 });
appointmentSchema.index({ doctorId: 1, dateTime: 1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ status: 1 });

export default model<IAppointment>('Appointment', appointmentSchema); 