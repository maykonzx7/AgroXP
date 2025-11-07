import { Parcel } from '../associations.js';

// Get all parcels
export const getAllParcels = async () => {
  return await Parcel.findAll({
    include: [
      { model: Parcel.associations.crops.target, as: 'crops' },
      { model: Parcel.associations.livestocks.target, as: 'livestocks' }
    ]
  });
};

// Get a specific parcel by ID
export const getParcelById = async (id) => {
  return await Parcel.findByPk(id, {
    include: [
      { model: Parcel.associations.crops.target, as: 'crops' },
      { model: Parcel.associations.livestocks.target, as: 'livestocks' }
    ]
  });
};

// Create a new parcel
export const createParcel = async (parcelData) => {
  return await Parcel.create(parcelData);
};

// Update a parcel
export const updateParcel = async (id, parcelData) => {
  const parcel = await Parcel.findByPk(id);
  if (!parcel) {
    throw new Error('Parcel not found');
  }
  return await parcel.update(parcelData);
};

// Delete a parcel
export const deleteParcel = async (id) => {
  const parcel = await Parcel.findByPk(id);
  if (!parcel) {
    throw new Error('Parcel not found');
  }
  return await parcel.destroy();
};

export default {
  getAllParcels,
  getParcelById,
  createParcel,
  updateParcel,
  deleteParcel
};