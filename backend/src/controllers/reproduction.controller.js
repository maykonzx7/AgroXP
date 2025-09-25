import Reproduction from '../modules/livestock/reproduction.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';

// Get all reproduction records
export const getReproductions = async (req, res) => {
  try {
    const reproductions = await Reproduction.findAll({
      include: [{ model: Livestock, as: 'livestock' }]
    });
    res.json(reproductions);
  } catch (error) {
    console.error('Get reproductions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get reproduction records for a specific livestock
export const getReproductionsByLivestock = async (req, res) => {
  try {
    const { livestockId } = req.params;
    const reproductions = await Reproduction.findAll({
      where: { livestockId },
      include: [{ model: Livestock, as: 'livestock' }]
    });
    res.json(reproductions);
  } catch (error) {
    console.error('Get reproductions by livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific reproduction record by ID
export const getReproductionById = async (req, res) => {
  try {
    const { id } = req.params;
    const reproduction = await Reproduction.findByPk(id, {
      include: [{ model: Livestock, as: 'livestock' }]
    });
    
    if (!reproduction) {
      return res.status(404).json({ error: 'Reproduction record not found' });
    }
    
    res.json(reproduction);
  } catch (error) {
    console.error('Get reproduction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new reproduction record
export const createReproduction = async (req, res) => {
  try {
    const reproduction = await Reproduction.create(req.body);
    res.status(201).json(reproduction);
  } catch (error) {
    console.error('Create reproduction error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Update a reproduction record
export const updateReproduction = async (req, res) => {
  try {
    const { id } = req.params;
    const reproduction = await Reproduction.findByPk(id);
    
    if (!reproduction) {
      return res.status(404).json({ error: 'Reproduction record not found' });
    }
    
    await reproduction.update(req.body);
    res.json(reproduction);
  } catch (error) {
    console.error('Update reproduction error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Delete a reproduction record
export const deleteReproduction = async (req, res) => {
  try {
    const { id } = req.params;
    const reproduction = await Reproduction.findByPk(id);
    
    if (!reproduction) {
      return res.status(404).json({ error: 'Reproduction record not found' });
    }
    
    await reproduction.destroy();
    res.json({ message: 'Reproduction record deleted successfully' });
  } catch (error) {
    console.error('Delete reproduction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getReproductions,
  getReproductionsByLivestock,
  getReproductionById,
  createReproduction,
  updateReproduction,
  deleteReproduction
};