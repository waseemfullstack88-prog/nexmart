import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as storeService from './stores.service';

export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.createStore(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: store,
    message: 'Store created successfully',
  });
});

export const getMyStore = asyncHandler(async (req: Request, res: Response) => {
  // Using req.storeContext populated by requireStoreId middleware
  const store = await storeService.getStoreDetails(req.storeContext!.storeId);
  res.json({
    success: true,
    data: store,
  });
});

export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.updateStore(req.storeContext!.storeId, req.body);
  res.json({
    success: true,
    data: store,
    message: 'Store updated successfully',
  });
});

export const addDomain = asyncHandler(async (req: Request, res: Response) => {
  const domain = await storeService.addDomain(req.storeContext!.storeId, req.body);
  res.status(201).json({
    success: true,
    data: domain,
    message: 'Domain added successfully',
  });
});

export const removeDomain = asyncHandler(async (req: Request, res: Response) => {
  const domainId = Array.isArray(req.params.domainId) ? req.params.domainId[0] : req.params.domainId;
  await storeService.removeDomain(req.storeContext!.storeId, domainId);
  res.json({
    success: true,
    message: 'Domain removed successfully',
  });
});
