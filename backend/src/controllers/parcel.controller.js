import { Parcel } from '../associations.js';

// Get all parcels
export const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.findAll({
      include: [
        { model: Parcel.associations.crops.target, as: 'crops' },
        { model: Parcel.associations.livestocks.target, as: 'livestocks' }
      ]
    });
    res.json(parcels);
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific parcel by ID
export const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await Parcel.findByPk(id, {
      include: [
        { model: Parcel.associations.crops.target, as: 'crops' },
        { model: Parcel.associations.livestocks.target, as: 'livestocks' }
      ]
    });
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    res.json(parcel);
  } catch (error) {
    console.error('Get parcel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new parcel
export const createParcel = async (req, res) => {
  try {
    const parcel = await Parcel.create(req.body);
    res.status(201).json(parcel);
  } catch (error) {
    console.error('Create parcel error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Update a parcel
export const updateParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await Parcel.findByPk(id);
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    await parcel.update(req.body);
    res.json(parcel);
  } catch (error) {
    console.error('Update parcel error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Delete a parcel
export const deleteParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await Parcel.findByPk(id);
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    await parcel.destroy();
    res.json({ message: 'Parcel deleted successfully' });
  } catch (error) {
    console.error('Delete parcel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getParcels,
  getParcelById,
  createParcel,
  updateParcel,
  deleteParcel
};