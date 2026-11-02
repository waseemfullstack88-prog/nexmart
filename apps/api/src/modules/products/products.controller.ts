import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as productService from './products.service';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const isPublic = !req.user;
  const result = await productService.getProducts(req.storeContext!.storeId, req.query, isPublic);
  res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const isPublic = !req.user;
  const idOrSlug = Array.isArray(req.params.idOrSlug) ? req.params.idOrSlug[0] : req.params.idOrSlug;
  const product = await productService.getProductByIdOrSlug(
    req.storeContext!.storeId,
    idOrSlug,
    isPublic
  );
  res.json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.storeContext!.storeId, req.body);
  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully',
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const product = await productService.updateProduct(
    req.storeContext!.storeId,
    id,
    req.body
  );
  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully',
  });
});

export const duplicateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const product = await productService.duplicateProduct(req.storeContext!.storeId, id);
  res.status(201).json({
    success: true,
    data: product,
    message: 'Product duplicated successfully',
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await productService.deleteProduct(req.storeContext!.storeId, id);
  res.json({
    success: true,
    message: result.message,
  });
});

export const reorderImages = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await productService.reorderProductImages(req.storeContext!.storeId, id, req.body);
  res.json({
    success: true,
    message: 'Images reordered successfully',
  });
});
