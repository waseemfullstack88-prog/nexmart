import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  parentId: z.string().uuid().nullable().optional(),
  imageMediaId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderCategoriesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
      parentId: z.string().uuid().nullable().optional(),
    })
  ).min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
