import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
