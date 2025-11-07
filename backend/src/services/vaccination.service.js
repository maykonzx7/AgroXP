import Vaccination from '../modules/livestock/vaccination.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';

// Get all vaccination records
export const getAllVaccinations = async () => {
  return await Vaccination.findAll({
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Get vaccination records for a specific livestock
export const getVaccinationsByLivestock = async (livestockId) => {
  return await Vaccination.findAll({
    where: { livestockId },
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Get a specific vaccination record by ID
export const getVaccinationById = async (id) => {
  return await Vaccination.findByPk(id, {
    include: [{ model: Livestock, as: 'livestock' }]
  });
};

// Create a new vaccination record
export const createVaccination = async (vaccinationData) => {
  return await Vaccination.create(vaccinationData);
};

// Update a vaccination record
export const updateVaccination = async (id, vaccinationData) => {
  const vaccination = await Vaccination.findByPk(id);
  if (!vaccination) {
    throw new Error('Vaccination record not found');
  }
  return await vaccination.update(vaccinationData);
};

// Delete a vaccination record
export const deleteVaccination = async (id) => {
  const vaccination = await Vaccination.findByPk(id);
  if (!vaccination) {
    throw new Error('Vaccination record not found');
  }
  return await vaccination.destroy();
};

export default {
  getAllVaccinations,
  getVaccinationsByLivestock,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination
};