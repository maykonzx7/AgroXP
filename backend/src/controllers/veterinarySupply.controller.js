import VeterinarySupply from '../modules/livestock/veterinarySupply.model.js';

// Get all veterinary supplies
export const getVeterinarySupplies = async (req, res) => {
  try {
    const supplies = await VeterinarySupply.findAll();
    res.json(supplies);
  } catch (error) {
    console.error('Get veterinary supplies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific veterinary supply by ID
export const getVeterinarySupplyById = async (req, res) => {
  try {
    const { id } = req.params;
    const supply = await VeterinarySupply.findByPk(id);
    
    if (!supply) {
      return res.status(404).json({ error: 'Veterinary supply not found' });
    }
    
    res.json(supply);
  } catch (error) {
    console.error('Get veterinary supply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new veterinary supply
export const createVeterinarySupply = async (req, res) => {
  try {
    const supply = await VeterinarySupply.create(req.body);
    res.status(201).json(supply);
  } catch (error) {
    console.error('Create veterinary supply error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Update a veterinary supply
export const updateVeterinarySupply = async (req, res) => {
  try {
    const { id } = req.params;
    const supply = await VeterinarySupply.findByPk(id);
    
    if (!supply) {
      return res.status(404).json({ error: 'Veterinary supply not found' });
    }
    
    await supply.update(req.body);
    res.json(supply);
  } catch (error) {
    console.error('Update veterinary supply error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Delete a veterinary supply
export const deleteVeterinarySupply = async (req, res) => {
  try {
    const { id } = req.params;
    const supply = await VeterinarySupply.findByPk(id);
    
    if (!supply) {
      return res.status(404).json({ error: 'Veterinary supply not found' });
    }
    
    await supply.destroy();
    res.json({ message: 'Veterinary supply deleted successfully' });
  } catch (error) {
    console.error('Delete veterinary supply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getVeterinarySupplies,
  getVeterinarySupplyById,
  createVeterinarySupply,
  updateVeterinarySupply,
  deleteVeterinarySupply
};