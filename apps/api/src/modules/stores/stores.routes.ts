import { Router } from 'express';
import * as storesController from './stores.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireStoreId } from '../../middleware/authorize';
import { createStoreSchema, updateStoreSchema, addDomainSchema } from './stores.validation';
import { resolveTenant } from '../../middleware/tenant';

const router = Router();

// Requires authentication for all routes
router.use(authenticate);

// Initial store creation (user doesn't need to be assigned to a store yet)
router.post('/', validate({ body: createStoreSchema }), storesController.createStore);

// Requires user to have a store assigned
router.use(resolveTenant);
router.use(requireStoreId);

// My store operations
router.get('/me', storesController.getMyStore);
router.patch('/me', validate({ body: updateStoreSchema }), storesController.updateStore);

// Domain management for my store
router.post('/domains', validate({ body: addDomainSchema }), storesController.addDomain);
router.delete('/domains/:domainId', storesController.removeDomain);

export default router;
