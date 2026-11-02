import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.validation';

const router = Router();

// Public routes
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, validate({ body: updateProfileSchema }), authController.updateProfile);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);

export default router;
