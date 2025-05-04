import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'patient',
    });

    await user.validate();
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    next({
      error: error,
      message: 'An error occurred during registration',
      status: 500,
    });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Create and assign token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next({
      error: error,
      message: 'An error occurred during login',
      status: 500,
    });
  }
};

export const me = (req: Request, res: Response, next: NextFunction): void => {
  // @ts-ignore - TypeScript doesn't recognize we've declared the user property
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }
  res.status(200).json({
    success: true,
    // @ts-ignore - TypeScript doesn't recognize we've declared the user property
    user: req.user,
  });
};
