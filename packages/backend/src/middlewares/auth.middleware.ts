// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Fail fast if JWT secret is not set
if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment');
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT and attach user to req.user
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { id: string };
    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
      return;
    }

    // @ts-ignore - TypeScript doesn't recognize we've declared the user property
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Restrict access based on user roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore - TypeScript doesn't recognize we've declared the user property
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in first.',
      });
      return;
    }

    // @ts-ignore - TypeScript doesn't recognize we've declared the user property
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};
