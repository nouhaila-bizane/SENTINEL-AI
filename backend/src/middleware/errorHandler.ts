import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Database validation error', details: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
};