import Feeding from '../modules/livestock/feeding.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';

// Get all feeding records
export const getAllFeedings = async () => {
  return await Feeding.findAll({
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Get feeding records for a specific livestock
export const getFeedingsByLivestock = async (livestockId) => {
  return await Feeding.findAll({
    where: { livestockId },
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Get a specific feeding record by ID
export const getFeedingById = async (id) => {
  return await Feeding.findByPk(id, {
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Create a new feeding record
export const createFeeding = async (feedingData) => {
  return await Feeding.create(feedingData);
};

// Update a feeding record
export const updateFeeding = async (id, feedingData) => {
  const feeding = await Feeding.findByPk(id);
  if (!feeding) {
    throw new Error('Feeding record not found');
  }
  return await feeding.update(feedingData);
};

// Delete a feeding record
export const deleteFeeding = async (id) => {
  const feeding = await Feeding.findByPk(id);
  if (!feeding) {
    throw new Error('Feeding record not found');
  }
  return await feeding.destroy();
};

export default {
  getAllFeedings,
  getFeedingsByLivestock,
  getFeedingById,
  createFeeding,
  updateFeeding,
  deleteFeeding
};