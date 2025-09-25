import Inventory from '../modules/inventory/Inventory.model.js';

// Get all inventory items
export const getAllInventoryItems = async () => {
  return await Inventory.findAll();
};

// Get a specific inventory item by ID
export const getInventoryItemById = async (id) => {
  return await Inventory.findByPk(id);
};

// Create a new inventory item
export const createInventoryItem = async (itemData) => {
  return await Inventory.create(itemData);
};

// Update an inventory item
export const updateInventoryItem = async (id, itemData) => {
  const item = await Inventory.findByPk(id);
  if (!item) {
    throw new Error('Inventory item not found');
  }
  return await item.update(itemData);
};

// Delete an inventory item
export const deleteInventoryItem = async (id) => {
  const item = await Inventory.findByPk(id);
  if (!item) {
    throw new Error('Inventory item not found');
  }
  return await item.destroy();
};

export default {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};