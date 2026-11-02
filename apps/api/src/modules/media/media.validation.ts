import { z } from 'zod';

export const updateMediaSchema = z.object({
  altText: z.string().max(255).optional(),
  filename: z.string().max(255).optional(),
});

export const bulkDeleteMediaSchema = z.object({
  mediaIds: z.array(z.string().uuid()).min(1, 'At least one media ID is required'),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type BulkDeleteMediaInput = z.infer<typeof bulkDeleteMediaSchema>;
