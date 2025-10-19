import express from 'express';
import { Parcel, Crop } from '../associations.js';
const router = express.Router();
// Get all parcels
router.get('/', async (req, res) => {
    try {
        const parcels = await Parcel.findAll({
            include: [{
                    model: Crop,
                    as: 'crops'
                }]
        });
        res.json(parcels);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get a specific parcel
router.get('/:id', async (req, res) => {
    try {
        const parcel = await Parcel.findByPk(req.params.id, {
            include: [{
                    model: Crop,
                    as: 'crops'
                }]
        });
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }
        res.json(parcel);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Create a new parcel
router.post('/', async (req, res) => {
    try {
        const parcel = await Parcel.create(req.body);
        res.status(201).json(parcel);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update a parcel
router.put('/:id', async (req, res) => {
    try {
        const parcel = await Parcel.findByPk(req.params.id);
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }
        await parcel.update(req.body);
        res.json(parcel);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete a parcel
router.delete('/:id', async (req, res) => {
    try {
        const parcel = await Parcel.findByPk(req.params.id);
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }
        await parcel.destroy();
        res.json({ message: 'Parcel deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
