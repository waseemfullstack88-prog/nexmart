import { z } from 'zod';

export const updateAppearanceSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  bgColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  buttonColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  buttonTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  fontFamily: z.string().min(1).max(50).optional(),
  borderRadius: z.string().min(1).max(20).optional(),
  headerStyle: z.string().min(1).max(30).optional(),
  footerStyle: z.string().min(1).max(30).optional(),
  productCardStyle: z.string().min(1).max(30).optional(),
  imageFit: z.enum(['CONTAIN', 'COVER', 'AUTO']).optional(),
  customCss: z.string().max(10000).optional(),
});

export type UpdateAppearanceInput = z.infer<typeof updateAppearanceSchema>;
