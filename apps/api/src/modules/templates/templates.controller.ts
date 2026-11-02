import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as templateService from './templates.service';

export const getTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const templates = await templateService.getAllTemplates();
  res.json({
    success: true,
    data: templates,
  });
});

export const getStoreTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await templateService.getStoreTemplate(req.storeContext!.storeId);
  res.json({
    success: true,
    data: template,
  });
});

export const switchTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { templateId } = req.body;
  const template = await templateService.switchStoreTemplate(req.storeContext!.storeId, templateId);
  res.json({
    success: true,
    data: template,
    message: 'Store template changed successfully. Data preserved.',
  });
});
