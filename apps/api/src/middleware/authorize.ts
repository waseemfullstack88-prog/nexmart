import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/enums';
import { ApiError } from '../utils';

/**
 * Authorization middleware — checks if the authenticated user has the required role(s).
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
};

/**
 * Ensure the authenticated user belongs to the store they're trying to access.
 * SUPER_ADMIN can access any store.
 */
export const requireStoreAccess = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  // Super admins can access any store
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Store owners and staff must have a storeId matching the request context
  if (!req.user.storeId) {
    return next(ApiError.forbidden('You are not assigned to any store'));
  }

  // If there's a store context, verify the user belongs to it
  if (req.storeContext && req.storeContext.storeId !== req.user.storeId) {
    return next(ApiError.forbidden('You do not have access to this store'));
  }

  next();
};

/**
 * Ensure request has a storeId (either from user or from store context).
 * Attaches storeId to be used by downstream handlers.
 */
export const requireStoreId = (req: Request, _res: Response, next: NextFunction) => {
  const storeId = req.storeContext?.storeId || req.user?.storeId;

  if (!storeId) {
    return next(ApiError.badRequest('Store context is required'));
  }

  // Ensure storeContext exists
  if (!req.storeContext) {
    req.storeContext = {
      storeId,
      storeName: '',
      storeSlug: '',
    };
  }

  next();
};
