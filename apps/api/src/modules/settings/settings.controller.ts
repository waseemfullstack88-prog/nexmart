import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as settingsService from './settings.service';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getStoreSettings(req.storeContext!.storeId);
  res.json({
    success: true,
    data: settings,
  });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateStoreSettings(req.storeContext!.storeId, req.body);
  res.json({
    success: true,
    data: settings,
    message: 'Store settings updated successfully',
  });
});
