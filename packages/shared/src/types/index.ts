
// Common types used across frontend and backend

export interface User {
    _id?: string;
    username: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
  }
  
  export interface Doctor {
    _id?: string;
    userId: string;
    name: string;
    specialty: string;
    bio?: string;
    workingHours: WorkingHours[];
    unavailableTimes?: UnavailableTime[];
  }
  
  export interface WorkingHours {
    dayOfWeek: number; // 0-6, 0 is Sunday
    startTime: string; // format: "HH:MM"
    endTime: string; // format: "HH:MM"
  }
  
  export interface UnavailableTime {
    startDateTime: Date;
    endDateTime: Date;
    reason?: string;
  }
  
  export interface Appointment {
    _id?: string;
    patientId: string;
    doctorId: string;
    dateTime: Date;
    endTime: Date;
    reasonForVisit: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    notes?: string;
    reminderSent: boolean;
    reminderTime: Date;
  }
  
  export interface TimeSlot {
    start: Date;
    end: Date;
    isAvailable: boolean;
  }