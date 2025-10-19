import { Crop } from '../associations.js';
// Get all crops
export const getAllCrops = async () => {
    return await Crop.findAll({
        include: [{ model: Crop.associations.parcel.target, as: 'parcel' }]
    });
};
// Get a specific crop by ID
export const getCropById = async (id) => {
    return await Crop.findByPk(id, {
        include: [{ model: Crop.associations.parcel.target, as: 'parcel' }]
    });
};
// Create a new crop
export const createCrop = async (cropData) => {
    return await Crop.create(cropData);
};
// Update a crop
export const updateCrop = async (id, cropData) => {
    const crop = await Crop.findByPk(id);
    if (!crop) {
        throw new Error('Crop not found');
    }
    return await crop.update(cropData);
};
// Delete a crop
export const deleteCrop = async (id) => {
    const crop = await Crop.findByPk(id);
    if (!crop) {
        throw new Error('Crop not found');
    }
    return await crop.destroy();
};
export default {
    getAllCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop
};
