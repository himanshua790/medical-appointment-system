import { Schema, model } from 'mongoose';
import { IDoctor, IWorkingHours, IUnavailableTime } from '@medical/shared/types';

// Create nested schemas for complex types
const workingHoursSchema = new Schema<IWorkingHours>({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const unavailableTimeSchema = new Schema<IUnavailableTime>({
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  reason: { type: String },
});

const doctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    bio: { type: String },
    workingHours: [workingHoursSchema],
    unavailableTimes: [unavailableTimeSchema],
  },
  { timestamps: true }
);

// Add index for better query performance
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialty: 1 });

export default model<IDoctor>('Doctor', doctorSchema); 