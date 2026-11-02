import { Router } from 'express';
import * as templateController from './templates.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { resolveTenant, requireTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';

const router = Router();

// Anyone can browse templates
router.get('/', templateController.getTemplates);

// Get current store template (public storefront)
router.get('/active', optionalAuth, resolveTenant, requireTenant, templateController.getStoreTemplate);

// Switch store template (admin only)
router.post(
  '/switch',
  authenticate,
  resolveTenant,
  requireStoreId,
  templateController.switchTemplate
);

export default router;
