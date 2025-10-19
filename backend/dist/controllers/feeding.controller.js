import Feeding from '../modules/livestock/feeding.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';
// Get all feeding records
export const getFeedings = async (req, res) => {
    try {
        const feedings = await Feeding.findAll({
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(feedings);
    }
    catch (error) {
        console.error('Get feedings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get feeding records for a specific livestock
export const getFeedingsByLivestock = async (req, res) => {
    try {
        const { livestockId } = req.params;
        const feedings = await Feeding.findAll({
            where: { livestockId },
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(feedings);
    }
    catch (error) {
        console.error('Get feedings by livestock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get a specific feeding record by ID
export const getFeedingById = async (req, res) => {
    try {
        const { id } = req.params;
        const feeding = await Feeding.findByPk(id, {
            include: [{ model: Livestock, as: 'livestock' }]
        });
        if (!feeding) {
            return res.status(404).json({ error: 'Feeding record not found' });
        }
        res.json(feeding);
    }
    catch (error) {
        console.error('Get feeding error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Create a new feeding record
export const createFeeding = async (req, res) => {
    try {
        const feeding = await Feeding.create(req.body);
        res.status(201).json(feeding);
    }
    catch (error) {
        console.error('Create feeding error:', error);
        res.status(400).json({ error: 'Bad request' });
    }
};
// Update a feeding record
export const updateFeeding = async (req, res) => {
    try {
        const { id } = req.params;
        const feeding = await Feeding.findByPk(id);
        if (!feeding) {
            return res.status(404).json({ error: 'Feeding record not found' });
        }
        await feeding.update(req.body);
        res.json(feeding);
    }
    catch (error) {
        console.error('Update feeding error:', error);
        res.status(400).json({ error: 'Bad request' });
    }
};
// Delete a feeding record
export const deleteFeeding = async (req, res) => {
    try {
        const { id } = req.params;
        const feeding = await Feeding.findByPk(id);
        if (!feeding) {
            return res.status(404).json({ error: 'Feeding record not found' });
        }
        await feeding.destroy();
        res.json({ message: 'Feeding record deleted successfully' });
    }
    catch (error) {
        console.error('Delete feeding error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export default {
    getFeedings,
    getFeedingsByLivestock,
    getFeedingById,
    createFeeding,
    updateFeeding,
    deleteFeeding
};
