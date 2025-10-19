import express from 'express';
import Crop from './Crop.model.js';
const router = express.Router();
// Get all crops
router.get('/', async (req, res) => {
    try {
        const crops = await Crop.findAll();
        res.json(crops);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get a specific crop
router.get('/:id', async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.json(crop);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Create a new crop
router.post('/', async (req, res) => {
    try {
        const crop = await Crop.create(req.body);
        res.status(201).json(crop);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update a crop
router.put('/:id', async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        await crop.update(req.body);
        res.json(crop);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete a crop
router.delete('/:id', async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        await crop.destroy();
        res.json({ message: 'Crop deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
