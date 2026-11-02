import { z } from 'zod';

export const updateCustomerStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
