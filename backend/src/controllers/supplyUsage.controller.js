import LivestockSupplyUsage from '../modules/livestock/livestockSupplyUsage.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';
import VeterinarySupply from '../modules/livestock/veterinarySupply.model.js';

// Get all supply usage records
export const getSupplyUsages = async (req, res) => {
  try {
    const usages = await LivestockSupplyUsage.findAll({
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    res.json(usages);
  } catch (error) {
    console.error('Get supply usages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get supply usage records for a specific livestock
export const getSupplyUsagesByLivestock = async (req, res) => {
  try {
    const { livestockId } = req.params;
    const usages = await LivestockSupplyUsage.findAll({
      where: { livestockId },
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    res.json(usages);
  } catch (error) {
    console.error('Get supply usages by livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get supply usage records for a specific supply
export const getSupplyUsagesBySupply = async (req, res) => {
  try {
    const { supplyId } = req.params;
    const usages = await LivestockSupplyUsage.findAll({
      where: { supplyId },
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    res.json(usages);
  } catch (error) {
    console.error('Get supply usages by supply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific supply usage record by ID
export const getSupplyUsageById = async (req, res) => {
  try {
    const { id } = req.params;
    const usage = await LivestockSupplyUsage.findByPk(id, {
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    
    if (!usage) {
      return res.status(404).json({ error: 'Supply usage record not found' });
    }
    
    res.json(usage);
  } catch (error) {
    console.error('Get supply usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new supply usage record
export const createSupplyUsage = async (req, res) => {
  try {
    const usage = await LivestockSupplyUsage.create(req.body);
    res.status(201).json(usage);
  } catch (error) {
    console.error('Create supply usage error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Update a supply usage record
export const updateSupplyUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const usage = await LivestockSupplyUsage.findByPk(id);
    
    if (!usage) {
      return res.status(404).json({ error: 'Supply usage record not found' });
    }
    
    await usage.update(req.body);
    res.json(usage);
  } catch (error) {
    console.error('Update supply usage error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Delete a supply usage record
export const deleteSupplyUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const usage = await LivestockSupplyUsage.findByPk(id);
    
    if (!usage) {
      return res.status(404).json({ error: 'Supply usage record not found' });
    }
    
    await usage.destroy();
    res.json({ message: 'Supply usage record deleted successfully' });
  } catch (error) {
    console.error('Delete supply usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getSupplyUsages,
  getSupplyUsagesByLivestock,
  getSupplyUsagesBySupply,
  getSupplyUsageById,
  createSupplyUsage,
  updateSupplyUsage,
  deleteSupplyUsage
};