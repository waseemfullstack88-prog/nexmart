import { Router } from 'express';
import * as settingsController from './settings.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { resolveTenant, requireTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import { updateSettingsSchema } from './settings.validation';

const router = Router();

// Public / Storefront can read settings
router.get('/', optionalAuth, resolveTenant, requireTenant, settingsController.getSettings);

// Store Admin updates settings
router.patch(
  '/',
  authenticate,
  resolveTenant,
  requireStoreId,
  validate({ body: updateSettingsSchema }),
  settingsController.updateSettings
);

export default router;
