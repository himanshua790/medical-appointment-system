
// Common types used across frontend and backend

export interface IUser {
    _id?: string;
    username: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor' | 'admin';
  }
  
  export interface IDoctor {
    _id?: string;
    userId: string;
    name: string;
    specialty: string;
    bio?: string;
    workingHours: IWorkingHours[];
    unavailableTimes?: IUnavailableTime[];
  }
  
  export interface IWorkingHours {
    dayOfWeek: number; // 0-6, 0 is Sunday
    startTime: string; // format: "HH:MM"
    endTime: string; // format: "HH:MM"
  }
  
  export interface IUnavailableTime {
    startDateTime: Date;
    endDateTime: Date;
    reason?: string;
  }
  
  export interface IAppointment {
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
  
  export interface ITimeSlot {
    start: Date;
    end: Date;
    isAvailable: boolean;
  }