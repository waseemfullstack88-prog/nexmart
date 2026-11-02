import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils';

/**
 * Tenant resolution middleware.
 * Resolves the store context from:
 * 1. X-Store-Domain header (development)
 * 2. Host header (production - custom domains)
 * 3. x-store-id header (admin panel direct access)
 * 4. User's storeId (from JWT for store admin requests)
 *
 * This is the CORE of multi-tenant isolation.
 * Every tenant-scoped query MUST use req.storeContext.storeId.
 */
export const resolveTenant = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let storeId: string | null = null;
    let store: { id: string; name: string; slug: string; status: string } | null = null;

    // Priority 1: Explicit store ID header (from admin panel)
    const storeIdHeader = req.headers['x-store-id'] as string;
    if (storeIdHeader) {
      store = await prisma.store.findUnique({
        where: { id: storeIdHeader },
        select: { id: true, name: true, slug: true, status: true },
      });
      if (store) storeId = store.id;
    }

    // Priority 2: Custom domain header (for development/testing)
    if (!storeId) {
      const domainHeader = req.headers['x-store-domain'] as string;
      if (domainHeader) {
        const domain = await prisma.storeDomain.findUnique({
          where: { domain: domainHeader },
          include: {
            store: { select: { id: true, name: true, slug: true, status: true } },
          },
        });
        if (domain) {
          store = domain.store;
          storeId = store.id;
        }
      }
    }

    // Priority 3: Host header (production custom domains)
    if (!storeId) {
      const host = req.hostname;
      if (host && host !== 'localhost' && !host.includes('127.0.0.1')) {
        const domain = await prisma.storeDomain.findUnique({
          where: { domain: host },
          include: {
            store: { select: { id: true, name: true, slug: true, status: true } },
          },
        });
        if (domain) {
          store = domain.store;
          storeId = store.id;
        }
      }
    }

    // Priority 4: User's store (from auth)
    if (!storeId && req.user?.storeId) {
      store = await prisma.store.findUnique({
        where: { id: req.user.storeId },
        select: { id: true, name: true, slug: true, status: true },
      });
      if (store) storeId = store.id;
    }

    if (store && storeId) {
      if (store.status === 'SUSPENDED') {
        throw ApiError.forbidden('This store has been suspended');
      }

      req.storeContext = {
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Requires that a store context has been resolved.
 * Use this AFTER resolveTenant on routes that must be store-scoped.
 */
export const requireTenant = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.storeContext?.storeId) {
    return next(ApiError.badRequest('Could not determine store. Please check your domain or store configuration.'));
  }
  next();
};
