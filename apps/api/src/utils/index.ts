import { Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../types';

/**
 * Wraps async route handlers to catch errors and forward to Express error handler.
 */
export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom API error class with HTTP status code.
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static tooLarge(message = 'File too large') {
    return new ApiError(413, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

/**
 * Generate a URL-safe slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique order number.
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Parse pagination parameters from query string.
 */
export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
  const skip = (page - 1) * limit;
  const search = typeof query.search === 'string' ? query.search.trim() : undefined;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, search, sortBy, sortOrder: sortOrder as 'asc' | 'desc' };
}

/**
 * Build pagination meta for API response.
 */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
