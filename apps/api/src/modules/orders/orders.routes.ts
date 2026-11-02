import { Router } from 'express';
import * as ordersController from './orders.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { resolveTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import { updateOrderStatusSchema, updatePaymentStatusSchema } from './orders.validation';

const router = Router();

// All routes are protected and require store admin/owner
router.use(authenticate, resolveTenant, requireStoreId);

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrder);

router.patch(
  '/:id/status',
  validate({ body: updateOrderStatusSchema }),
  ordersController.updateOrderStatus
);

router.patch(
  '/:id/payment-status',
  validate({ body: updatePaymentStatusSchema }),
  ordersController.updatePaymentStatus
);

router.delete('/:id', ordersController.deleteOrder);

export default router;
