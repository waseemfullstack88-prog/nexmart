import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as categoryService from './categories.service';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const isTree = req.query.tree === 'true';
  const includeDisabled = req.query.includeDisabled === 'true';
  const categories = await categoryService.getStoreCategories(req.storeContext!.storeId, {
    tree: isTree,
    includeDisabled,
  });
  res.json({
    success: true,
    data: categories,
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const idOrSlug = Array.isArray(req.params.idOrSlug) ? req.params.idOrSlug[0] : req.params.idOrSlug;
  const category = await categoryService.getCategoryByIdOrSlug(req.storeContext!.storeId, idOrSlug);
  res.json({
    success: true,
    data: category,
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.storeContext!.storeId, req.body);
  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully',
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const category = await categoryService.updateCategory(req.storeContext!.storeId, id, req.body);
  res.json({
    success: true,
    data: category,
    message: 'Category updated successfully',
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await categoryService.deleteCategory(req.storeContext!.storeId, id);
  res.json({
    success: true,
    message: result.message,
  });
});

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.reorderCategories(req.storeContext!.storeId, req.body);
  res.json({
    success: true,
    message: 'Categories reordered successfully',
  });
});
