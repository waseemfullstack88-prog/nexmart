import { Router } from 'express';
import * as categoryController from './categories.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { resolveTenant, requireTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
} from './categories.validation';

const router = Router();

// Public & Storefront routes (resolve tenant from host/headers or auth)
router.get('/', optionalAuth, resolveTenant, requireTenant, categoryController.getCategories);
router.get('/:idOrSlug', optionalAuth, resolveTenant, requireTenant, categoryController.getCategory);

// Protected Admin routes
router.post(
  '/',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: createCategorySchema }),
  categoryController.createCategory
);

router.post(
  '/reorder',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: reorderCategoriesSchema }),
  categoryController.reorderCategories
);

router.patch(
  '/:id',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: updateCategorySchema }),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  resolveTenant,
  requireStoreId,
  categoryController.deleteCategory
);

export default router;
