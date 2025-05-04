import { Express } from 'express';
import { Document } from 'mongoose';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: Document & {
        _id: any;
        username: string;
        email: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export {}; 