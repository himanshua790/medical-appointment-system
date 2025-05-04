import { Express } from 'express';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: any;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export {}; 