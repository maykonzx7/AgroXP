import Vaccination from '../modules/livestock/vaccination.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';

// Get all vaccination records
export const getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.findAll({
      include: [{ model: Livestock, as: 'livestock' }]
    });
    res.json(vaccinations);
  } catch (error) {
    console.error('Get vaccinations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get vaccination records for a specific livestock
export const getVaccinationsByLivestock = async (req, res) => {
  try {
    const { livestockId } = req.params;
    const vaccinations = await Vaccination.findAll({
      where: { livestockId },
      include: [{ model: Livestock, as: 'livestock' }]
    });
    res.json(vaccinations);
  } catch (error) {
    console.error('Get vaccinations by livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific vaccination record by ID
export const getVaccinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const vaccination = await Vaccination.findByPk(id, {
      include: [{ model: Livestock, as: 'livestock' }]
    });
    
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination record not found' });
    }
    
    res.json(vaccination);
  } catch (error) {
    console.error('Get vaccination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new vaccination record
export const createVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.create(req.body);
    res.status(201).json(vaccination);
  } catch (error) {
    console.error('Create vaccination error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Update a vaccination record
export const updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const vaccination = await Vaccination.findByPk(id);
    
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination record not found' });
    }
    
    await vaccination.update(req.body);
    res.json(vaccination);
  } catch (error) {
    console.error('Update vaccination error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Delete a vaccination record
export const deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const vaccination = await Vaccination.findByPk(id);
    
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination record not found' });
    }
    
    await vaccination.destroy();
    res.json({ message: 'Vaccination record deleted successfully' });
  } catch (error) {
    console.error('Delete vaccination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getVaccinations,
  getVaccinationsByLivestock,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination
};