import { Request, Response, NextFunction } from 'express';
import { UserRole } from './enums';

// Extend Express Request with our custom properties
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  storeId: string | null;
  firstName: string;
  lastName: string;
}

export interface StoreContext {
  storeId: string;
  storeName: string;
  storeSlug: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      storeContext?: StoreContext;
    }
  }
}

// Standard API response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Typed request handler
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;
