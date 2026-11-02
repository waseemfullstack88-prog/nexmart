import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as mediaService from './media.service';

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
  const uploaded = await mediaService.uploadMediaFiles(req.storeContext!.storeId, files);
  res.status(201).json({
    success: true,
    data: uploaded,
    message: `${uploaded.length} image(s) uploaded and optimized successfully`,
  });
});

export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const result = await mediaService.getStoreMedia(req.storeContext!.storeId, req.query);
  res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

export const getMediaById = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const media = await mediaService.getMediaById(req.storeContext!.storeId, id);
  res.json({
    success: true,
    data: media,
  });
});

export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const media = await mediaService.updateMedia(req.storeContext!.storeId, id, req.body);
  res.json({
    success: true,
    data: media,
    message: 'Media details updated successfully',
  });
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const force = req.query.force === 'true';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await mediaService.deleteMedia(req.storeContext!.storeId, id, force);
  res.json({
    success: true,
    message: result.message,
  });
});

export const bulkDeleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const force = req.query.force === 'true';
  const result = await mediaService.bulkDeleteMedia(req.storeContext!.storeId, req.body.mediaIds, force);
  res.json({
    success: true,
    message: `${result.count} image(s) deleted successfully`,
  });
});
