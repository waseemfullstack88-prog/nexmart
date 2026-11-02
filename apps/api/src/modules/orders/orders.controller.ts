import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as ordersService from './orders.service';

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await ordersService.getOrders(req.storeContext!.storeId, req.query);
  res.json({
    success: true,
    data: result,
  });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await ordersService.getOrderById(req.storeContext!.storeId, req.params.id);
  res.json({
    success: true,
    data: result,
  });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await ordersService.updateOrderStatus(req.storeContext!.storeId, req.params.id, req.body);
  res.json({
    success: true,
    data: result,
    message: 'Order status updated successfully',
  });
});

export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await ordersService.updatePaymentStatus(req.storeContext!.storeId, req.params.id, req.body);
  res.json({
    success: true,
    data: result,
    message: 'Payment status updated successfully',
  });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await ordersService.deleteOrder(req.storeContext!.storeId, req.params.id);
  res.json({
    success: true,
    ...result,
  });
});
