import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  domain: z.string().min(3).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Valid domain is required'),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const addDomainSchema = z.object({
  domain: z.string().min(3).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Valid domain is required'),
  isPrimary: z.boolean().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type AddDomainInput = z.infer<typeof addDomainSchema>;
