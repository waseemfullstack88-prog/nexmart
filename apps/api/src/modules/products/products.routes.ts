import { Router } from 'express';
import * as productController from './products.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { resolveTenant, requireTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import {
  createProductSchema,
  updateProductSchema,
  reorderProductImagesSchema,
} from './products.validation';

const router = Router();

// Public & Storefront routes (resolve tenant from host/headers or auth)
router.get('/', optionalAuth, resolveTenant, requireTenant, productController.getProducts);
router.get('/:idOrSlug', optionalAuth, resolveTenant, requireTenant, productController.getProduct);

// Protected Store Admin routes
router.post(
  '/',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: createProductSchema }),
  productController.createProduct
);

router.post(
  '/:id/duplicate',
  authenticate,
  resolveTenant,
  requireStoreId,
  productController.duplicateProduct
);

router.post(
  '/:id/images/reorder',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: reorderProductImagesSchema }),
  productController.reorderImages
);

router.patch(
  '/:id',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: updateProductSchema }),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  resolveTenant,
  requireStoreId,
  productController.deleteProduct
);

export default router;
