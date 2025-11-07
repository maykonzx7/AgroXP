import Inventory from '../modules/inventory/Inventory.model.js';
// Get all inventory items
export const getInventoryItems = async (req, res) => {
    try {
        const items = await Inventory.findAll();
        res.json(items);
    }
    catch (error) {
        console.error('Get inventory items error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get a specific inventory item by ID
export const getInventoryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Inventory.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Get inventory item error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Create a new inventory item
export const createInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Create inventory item error:', error);
        res.status(400).json({ error: 'Bad request' });
    }
};
// Update an inventory item
export const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Inventory.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        await item.update(req.body);
        res.json(item);
    }
    catch (error) {
        console.error('Update inventory item error:', error);
        res.status(400).json({ error: 'Bad request' });
    }
};
// Delete an inventory item
export const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Inventory.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        await item.destroy();
        res.json({ message: 'Inventory item deleted successfully' });
    }
    catch (error) {
        console.error('Delete inventory item error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export default {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};
