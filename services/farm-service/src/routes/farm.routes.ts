import express from 'express';
import farmController from '../controllers/farm.controller.js';

const router = express.Router();

// Routes
router.get('/', farmController.getFarms);
router.get('/:id', farmController.getFarmById);
router.post('/', farmController.createFarm);
router.put('/:id', farmController.updateFarm);
router.delete('/:id', farmController.deleteFarm);

export default router;