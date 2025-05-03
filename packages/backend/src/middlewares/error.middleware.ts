import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
  message: string;
}

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default status and message
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  // Log error for server-side debugging
  console.error(`Error: ${status} - ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Respond with error
  res.status(status).json({
    success: false,
    message,
    // Only include error stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Not found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ErrorWithStatus;
  error.status = 404;
  next(error);
}; 