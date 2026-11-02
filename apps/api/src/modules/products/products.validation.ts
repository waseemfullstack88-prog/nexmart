import { z } from 'zod';

const variantImageSchema = z.object({
  mediaId: z.string().uuid(),
  sortOrder: z.number().int().default(0),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Variant name is required'),
  attributes: z.record(z.string()), // e.g. { Color: "Red", Size: "XL" }
  sku: z.string().optional(),
  price: z.number().nonnegative().optional(),
  stockQuantity: z.number().int().default(0),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  images: z.array(variantImageSchema).optional(),
});

const productImageInputSchema = z.object({
  mediaId: z.string().uuid(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1).max(220).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  specifications: z.record(z.string()).optional(),
  price: z.number().nonnegative('Price must be a positive number'),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  costPrice: z.number().nonnegative().nullable().optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  trackInventory: z.boolean().default(true),
  stockQuantity: z.number().int().default(0),
  lowStockThreshold: z.number().int().default(5),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
  imageFit: z.enum(['CONTAIN', 'COVER', 'AUTO']).default('AUTO'),
  weight: z.number().nonnegative().nullable().optional(),
  sortOrder: z.number().int().default(0),
  images: z.array(productImageInputSchema).optional(),
  variants: z.array(variantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const reorderProductImagesSchema = z.object({
  images: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
      isPrimary: z.boolean().optional(),
    })
  ).min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ReorderProductImagesInput = z.infer<typeof reorderProductImagesSchema>;
