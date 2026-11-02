import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';
import { ApiError } from '../utils';
import { AuthenticatedUser } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  storeId: string | null;
}

/**
 * Authentication middleware — validates JWT token and attaches user to request.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        storeId: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
      firstName: user.firstName,
      lastName: user.lastName,
    } as AuthenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication — doesn't fail if no token, but attaches user if present.
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          storeId: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
          firstName: user.firstName,
          lastName: user.lastName,
        } as AuthenticatedUser;
      }
    } catch {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};
