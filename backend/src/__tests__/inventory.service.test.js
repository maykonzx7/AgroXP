import Inventory from '../modules/inventory/Inventory.model.js';
import * as inventoryService from '../services/inventory.service.js';

// Mock the Inventory model
jest.mock('../modules/inventory/Inventory.model.js', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllInventoryItems', () => {
    it('should return all inventory items', async () => {
      const mockItems = [
        { id: 1, itemName: 'Fertilizer', category: 'Supplies', quantity: 100, unit: 'kg', cost: 500.00 },
        { id: 2, itemName: 'Seeds', category: 'Supplies', quantity: 500, unit: 'packets', cost: 200.00 }
      ];

      Inventory.findAll.mockResolvedValue(mockItems);

      const result = await inventoryService.getAllInventoryItems();

      expect(result).toEqual(mockItems);
      expect(Inventory.findAll).toHaveBeenCalled();
    });
  });

  describe('getInventoryItemById', () => {
    it('should return an inventory item by id', async () => {
      const mockItem = { id: 1, itemName: 'Fertilizer', category: 'Supplies', quantity: 100, unit: 'kg', cost: 500.00 };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const result = await inventoryService.getInventoryItemById(1);

      expect(result).toEqual(mockItem);
      expect(Inventory.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return null if inventory item is not found', async () => {
      Inventory.findByPk.mockResolvedValue(null);

      const result = await inventoryService.getInventoryItemById(999);

      expect(result).toBeNull();
      expect(Inventory.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('createInventoryItem', () => {
    it('should create a new inventory item', async () => {
      const itemData = { itemName: 'Pesticide', category: 'Supplies', quantity: 50, unit: 'bottles', cost: 300.00 };
      const createdItem = { id: 3, ...itemData };

      Inventory.create.mockResolvedValue(createdItem);

      const result = await inventoryService.createInventoryItem(itemData);

      expect(result).toEqual(createdItem);
      expect(Inventory.create).toHaveBeenCalledWith(itemData);
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an existing inventory item', async () => {
      const itemData = { itemName: 'Updated Fertilizer', quantity: 150, cost: 600.00 };
      const updatedItem = { id: 1, ...itemData };

      const mockItem = {
        update: jest.fn().mockResolvedValue(updatedItem)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const result = await inventoryService.updateInventoryItem(1, itemData);

      expect(result).toEqual(updatedItem);
      expect(Inventory.findByPk).toHaveBeenCalledWith(1);
      expect(mockItem.update).toHaveBeenCalledWith(itemData);
    });

    it('should throw an error if inventory item is not found', async () => {
      Inventory.findByPk.mockResolvedValue(null);

      await expect(inventoryService.updateInventoryItem(999, {})).rejects.toThrow('Inventory item not found');
      expect(Inventory.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete an existing inventory item', async () => {
      const mockItem = {
        destroy: jest.fn().mockResolvedValue()
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      await expect(inventoryService.deleteInventoryItem(1)).resolves.not.toThrow();
      expect(Inventory.findByPk).toHaveBeenCalledWith(1);
      expect(mockItem.destroy).toHaveBeenCalled();
    });

    it('should throw an error if inventory item is not found', async () => {
      Inventory.findByPk.mockResolvedValue(null);

      await expect(inventoryService.deleteInventoryItem(999)).rejects.toThrow('Inventory item not found');
      expect(Inventory.findByPk).toHaveBeenCalledWith(999);
    });
  });
});