import { Router } from 'express';
import * as customersController from './customers.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { resolveTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import { updateCustomerStatusSchema } from './customers.validation';

const router = Router();

// All routes are protected and require store admin/owner
router.use(authenticate, resolveTenant, requireStoreId);

router.get('/', customersController.getCustomers);
router.get('/:id', customersController.getCustomer);

router.patch(
  '/:id/status',
  validate({ body: updateCustomerStatusSchema }),
  customersController.updateCustomerStatus
);

router.delete('/:id', customersController.deleteCustomer);

export default router;
