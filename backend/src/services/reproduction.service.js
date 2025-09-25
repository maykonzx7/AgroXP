import Reproduction from '../modules/livestock/reproduction.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';

// Get all reproduction records
export const getAllReproductions = async () => {
  return await Reproduction.findAll({
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Get reproduction records for a specific livestock
export const getReproductionsByLivestock = async (livestockId) => {
  return await Reproduction.findAll({
    where: { livestockId },
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Get a specific reproduction record by ID
export const getReproductionById = async (id) => {
  return await Reproduction.findByPk(id, {
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Create a new reproduction record
export const createReproduction = async (reproductionData) => {
  return await Reproduction.create(reproductionData);
};

// Update a reproduction record
export const updateReproduction = async (id, reproductionData) => {
  const reproduction = await Reproduction.findByPk(id);
  if (!reproduction) {
    throw new Error('Reproduction record not found');
  }
  return await reproduction.update(reproductionData);
};

// Delete a reproduction record
export const deleteReproduction = async (id) => {
  const reproduction = await Reproduction.findByPk(id);
  if (!reproduction) {
    throw new Error('Reproduction record not found');
  }
  return await reproduction.destroy();
};

export default {
  getAllReproductions,
  getReproductionsByLivestock,
  getReproductionById,
  createReproduction,
  updateReproduction,
  deleteReproduction
};