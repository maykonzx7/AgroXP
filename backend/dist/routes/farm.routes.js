import { Router } from 'express';
import farmController from '../controllers/farm.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
// All farm routes are protected
router.use(authenticate);
// Routes
router.post('/', farmController.createFarm);
router.get('/', farmController.getFarms);
router.get('/:id', farmController.getFarmById);
router.put('/:id', farmController.updateFarm);
router.delete('/:id', farmController.deleteFarm);
export default router;
