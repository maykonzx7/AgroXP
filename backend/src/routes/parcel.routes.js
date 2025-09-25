import express from 'express';
import parcelController from '../controllers/parcel.controller.js';
import { authenticate } from '../../dist/middleware/auth.middleware.js';

const router = express.Router();

// All parcel routes are protected
router.use(authenticate);

// Routes
router.get('/', parcelController.getParcels);
router.get('/:id', parcelController.getParcelById);
router.post('/', parcelController.createParcel);
router.put('/:id', parcelController.updateParcel);
router.delete('/:id', parcelController.deleteParcel);

export default router;