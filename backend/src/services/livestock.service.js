import { Livestock } from '../associations.js';

// Get all livestock
export const getAllLivestock = async () => {
  return await Livestock.findAll({
    include: [{ model: Livestock.associations.parcel.target, as: 'parcel' }]
  });
};

// Get a specific livestock by ID
export const getLivestockById = async (id) => {
  return await Livestock.findByPk(id, {
    include: [{ model: Livestock.associations.parcel.target, as: 'parcel' }]
  });
};

// Create a new livestock
export const createLivestock = async (livestockData) => {
  return await Livestock.create(livestockData);
};

// Update a livestock
export const updateLivestock = async (id, livestockData) => {
  const livestock = await Livestock.findByPk(id);
  if (!livestock) {
    throw new Error('Livestock not found');
  }
  return await livestock.update(livestockData);
};

// Delete a livestock
export const deleteLivestock = async (id) => {
  const livestock = await Livestock.findByPk(id);
  if (!livestock) {
    throw new Error('Livestock not found');
  }
  return await livestock.destroy();
};

export default {
  getAllLivestock,
  getLivestockById,
  createLivestock,
  updateLivestock,
  deleteLivestock
};