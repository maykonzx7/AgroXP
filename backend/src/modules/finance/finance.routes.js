import express from 'express';
import Finance from '../models/Finance.js';

const router = express.Router();

// Get all financial records
router.get('/', async (req, res) => {
  try {
    const records = await Finance.findAll();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific financial record
router.get('/:id', async (req, res) => {
  try {
    const record = await Finance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new financial record
router.post('/', async (req, res) => {
  try {
    const record = await Finance.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a financial record
router.put('/:id', async (req, res) => {
  try {
    const record = await Finance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }
    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a financial record
router.delete('/:id', async (req, res) => {
  try {
    const record = await Finance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }
    await record.destroy();
    res.json({ message: 'Financial record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;