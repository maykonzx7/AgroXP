import LivestockSupplyUsage from '../modules/livestock/livestockSupplyUsage.model.js';
import Livestock from '../modules/livestock/Livestock.model.js';
import VeterinarySupply from '../modules/livestock/veterinarySupply.model.js';
// Get all supply usage records
export const getAllSupplyUsages = async () => {
    return await LivestockSupplyUsage.findAll({
        include: [
            { model: Livestock, as: 'livestock' },
            { model: VeterinarySupply, as: 'supply' }
        ]
    });
};
// Get supply usage records for a specific livestock
export const getSupplyUsagesByLivestock = async (livestockId) => {
    return await LivestockSupplyUsage.findAll({
        where: { livestockId },
        include: [
            { model: Livestock, as: 'livestock' },
            { model: VeterinarySupply, as: 'supply' }
        ]
    });
};
// Get supply usage records for a specific supply
export const getSupplyUsagesBySupply = async (supplyId) => {
    return await LivestockSupplyUsage.findAll({
        where: { supplyId },
        include: [
            { model: Livestock, as: 'livestock' },
            { model: VeterinarySupply, as: 'supply' }
        ]
    });
};
// Get a specific supply usage record by ID
export const getSupplyUsageById = async (id) => {
    return await LivestockSupplyUsage.findByPk(id, {
        include: [
            { model: Livestock, as: 'livestock' },
            { model: VeterinarySupply, as: 'supply' }
        ]
    });
};
// Create a new supply usage record
export const createSupplyUsage = async (usageData) => {
    return await LivestockSupplyUsage.create(usageData);
};
// Update a supply usage record
export const updateSupplyUsage = async (id, usageData) => {
    const usage = await LivestockSupplyUsage.findByPk(id);
    if (!usage) {
        throw new Error('Supply usage record not found');
    }
    return await usage.update(usageData);
};
// Delete a supply usage record
export const deleteSupplyUsage = async (id) => {
    const usage = await LivestockSupplyUsage.findByPk(id);
    if (!usage) {
        throw new Error('Supply usage record not found');
    }
    return await usage.destroy();
};
export default {
    getAllSupplyUsages,
    getSupplyUsagesByLivestock,
    getSupplyUsagesBySupply,
    getSupplyUsageById,
    createSupplyUsage,
    updateSupplyUsage,
    deleteSupplyUsage
};
