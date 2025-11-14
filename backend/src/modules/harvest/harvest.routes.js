import express from 'express';
import Harvest from './Harvest.model.js';

const router = express.Router();

// Get all harvests
router.get('/', async (req, res) => {
  try {
    const harvests = await Harvest.findAll();
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific harvest
router.get('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    res.json(harvest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new harvest
router.post('/', async (req, res) => {
  try {
    const harvest = await Harvest.create(req.body);
    res.status(201).json(harvest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a harvest
router.put('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    await harvest.update(req.body);
    res.json(harvest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a harvest
router.delete('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    await harvest.destroy();
    res.json({ message: 'Harvest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;