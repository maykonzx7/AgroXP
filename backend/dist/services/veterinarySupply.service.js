import VeterinarySupply from '../modules/livestock/veterinarySupply.model.js';
// Get all veterinary supplies
export const getAllVeterinarySupplies = async () => {
    return await VeterinarySupply.findAll();
};
// Get a specific veterinary supply by ID
export const getVeterinarySupplyById = async (id) => {
    return await VeterinarySupply.findByPk(id);
};
// Create a new veterinary supply
export const createVeterinarySupply = async (supplyData) => {
    return await VeterinarySupply.create(supplyData);
};
// Update a veterinary supply
export const updateVeterinarySupply = async (id, supplyData) => {
    const supply = await VeterinarySupply.findByPk(id);
    if (!supply) {
        throw new Error('Veterinary supply not found');
    }
    return await supply.update(supplyData);
};
// Delete a veterinary supply
export const deleteVeterinarySupply = async (id) => {
    const supply = await VeterinarySupply.findByPk(id);
    if (!supply) {
        throw new Error('Veterinary supply not found');
    }
    return await supply.destroy();
};
export default {
    getAllVeterinarySupplies,
    getVeterinarySupplyById,
    createVeterinarySupply,
    updateVeterinarySupply,
    deleteVeterinarySupply
};
