import { Router } from 'express';
import authController from '../../dist/controllers/auth.controller.js';
import { authenticate } from '../../dist/middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;