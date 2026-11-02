import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils';
import { env } from '../config/env';

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error in development
  if (env.isDev) {
    console.error('Error:', err);
  }

  // Handle known ApiErrors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errors: err.errors,
    });
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    const multerErr = err as any;
    let message = 'File upload error';

    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      message = `File is too large. Maximum size is ${env.maxFileSizeKb} KB`;
    } else if (multerErr.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded at once';
    } else if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }

    return res.status(413).json({
      success: false,
      error: message,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        error: `A record with this ${field} already exists`,
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }

  // Unknown errors - don't expose details in production
  return res.status(500).json({
    success: false,
    error: env.isDev ? err.message : 'Internal server error',
  });
};
