import { Router } from 'express';
import * as appearanceController from './appearance.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { resolveTenant, requireTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import { updateAppearanceSchema } from './appearance.validation';

const router = Router();

// Public / Storefront can read appearance
router.get('/', optionalAuth, resolveTenant, requireTenant, appearanceController.getAppearance);

// Store Admin updates appearance
router.patch(
  '/',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: updateAppearanceSchema }),
  appearanceController.updateAppearance
);

export default router;
