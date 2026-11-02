import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as customersService from './customers.service';

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const result = await customersService.getCustomers(req.storeContext!.storeId, req.query);
  res.json({
    success: true,
    data: result,
  });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const result = await customersService.getCustomerById(req.storeContext!.storeId, req.params.id);
  res.json({
    success: true,
    data: result,
  });
});

export const updateCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await customersService.updateCustomerStatus(req.storeContext!.storeId, req.params.id, req.body);
  res.json({
    success: true,
    data: result,
    message: 'Customer status updated successfully',
  });
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const result = await customersService.deleteCustomer(req.storeContext!.storeId, req.params.id);
  res.json({
    success: true,
    ...result,
  });
});
