import { z } from 'zod';

export const updateSettingsSchema = z.object({
  storeName: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  currency: z.string().min(1).max(10).default('USD'),
  currencySymbol: z.string().min(1).max(5).default('$'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  copyrightText: z.string().max(255).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
  businessInfo: z.object({
    taxNumber: z.string().optional(),
    companyName: z.string().optional(),
  }).optional(),
  imageSettings: z.object({
    maxFileSizeKb: z.number().int().positive().optional(),
    maxWidth: z.number().int().positive().optional(),
    maxHeight: z.number().int().positive().optional(),
    quality: z.number().int().min(10).max(100).optional(),
    format: z.enum(['webp', 'jpeg', 'png', 'auto']).optional(),
  }).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
