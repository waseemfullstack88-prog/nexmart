import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as appearanceService from './appearance.service';

export const getAppearance = asyncHandler(async (req: Request, res: Response) => {
  const appearance = await appearanceService.getStoreAppearance(req.storeContext!.storeId);
  res.json({
    success: true,
    data: appearance,
  });
});

export const updateAppearance = asyncHandler(async (req: Request, res: Response) => {
  const appearance = await appearanceService.updateStoreAppearance(req.storeContext!.storeId, req.body);
  res.json({
    success: true,
    data: appearance,
    message: 'Store appearance updated successfully',
  });
});
