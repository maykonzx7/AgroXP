import express from 'express';
import Inventory from './Inventory.model.js';

const router = express.Router();

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.findAll();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific inventory item
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new inventory item
router.post('/', async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    await item.destroy();
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;