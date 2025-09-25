import request from 'supertest';
import express from 'express';
import inventoryController from '../controllers/inventory.controller.js';
import * as inventoryService from '../services/inventory.service.js';

// Create a mock express app for testing
const app = express();
app.use(express.json());

// Mock the routes
app.get('/inventory', inventoryController.getInventoryItems);
app.get('/inventory/:id', inventoryController.getInventoryItemById);
app.post('/inventory', inventoryController.createInventoryItem);
app.put('/inventory/:id', inventoryController.updateInventoryItem);
app.delete('/inventory/:id', inventoryController.deleteInventoryItem);

// Mock the service functions
jest.mock('../services/inventory.service.js');

describe('Inventory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /inventory', () => {
    it('should get all inventory items', async () => {
      const mockItems = [
        { id: 1, itemName: 'Fertilizer', category: 'Supplies', quantity: 100, unit: 'kg', cost: 500.00 },
        { id: 2, itemName: 'Seeds', category: 'Supplies', quantity: 500, unit: 'packets', cost: 200.00 }
      ];

      inventoryService.getAllInventoryItems.mockResolvedValue(mockItems);

      const response = await request(app).get('/inventory');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems);
      expect(inventoryService.getAllInventoryItems).toHaveBeenCalled();
    });

    it('should handle error when getting inventory items', async () => {
      inventoryService.getAllInventoryItems.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/inventory');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /inventory/:id', () => {
    it('should get an inventory item by id', async () => {
      const mockItem = { id: 1, itemName: 'Fertilizer', category: 'Supplies', quantity: 100, unit: 'kg', cost: 500.00 };

      inventoryService.getInventoryItemById.mockResolvedValue(mockItem);

      const response = await request(app).get('/inventory/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItem);
      expect(inventoryService.getInventoryItemById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when inventory item is not found', async () => {
      inventoryService.getInventoryItemById.mockResolvedValue(null);

      const response = await request(app).get('/inventory/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Inventory item not found' });
    });

    it('should handle error when getting an inventory item', async () => {
      inventoryService.getInventoryItemById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/inventory/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /inventory', () => {
    it('should create a new inventory item', async () => {
      const newItem = { itemName: 'Pesticide', category: 'Supplies', quantity: 50, unit: 'bottles', cost: 300.00 };
      const createdItem = { id: 3, ...newItem };

      inventoryService.createInventoryItem.mockResolvedValue(createdItem);

      const response = await request(app)
        .post('/inventory')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdItem);
      expect(inventoryService.createInventoryItem).toHaveBeenCalledWith(newItem);
    });

    it('should handle error when creating an inventory item', async () => {
      const newItem = { itemName: 'Pesticide', category: 'Supplies', quantity: 50, unit: 'bottles', cost: 300.00 };

      inventoryService.createInventoryItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/inventory')
        .send(newItem);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });

  describe('PUT /inventory/:id', () => {
    it('should update an inventory item', async () => {
      const updatedItem = { id: 1, itemName: 'Updated Fertilizer', category: 'Supplies', quantity: 150, unit: 'kg', cost: 600.00 };

      inventoryService.getInventoryItemById.mockResolvedValue({ id: 1 });
      inventoryService.updateInventoryItem.mockResolvedValue(updatedItem);

      const response = await request(app)
        .put('/inventory/1')
        .send({ itemName: 'Updated Fertilizer', quantity: 150, cost: 600.00 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedItem);
      expect(inventoryService.getInventoryItemById).toHaveBeenCalledWith('1');
      expect(inventoryService.updateInventoryItem).toHaveBeenCalledWith('1', {
        itemName: 'Updated Fertilizer',
        quantity: 150,
        cost: 600.00
      });
    });

    it('should return 404 when updating a non-existent inventory item', async () => {
      inventoryService.getInventoryItemById.mockResolvedValue(null);

      const response = await request(app)
        .put('/inventory/999')
        .send({ itemName: 'Updated Fertilizer', quantity: 150, cost: 600.00 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Inventory item not found' });
    });

    it('should handle error when updating an inventory item', async () => {
      inventoryService.getInventoryItemById.mockResolvedValue({ id: 1 });
      inventoryService.updateInventoryItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/inventory/1')
        .send({ itemName: 'Updated Fertilizer', quantity: 150, cost: 600.00 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });

  describe('DELETE /inventory/:id', () => {
    it('should delete an inventory item', async () => {
      inventoryService.getInventoryItemById.mockResolvedValue({ id: 1 });
      inventoryService.deleteInventoryItem.mockResolvedValue();

      const response = await request(app).delete('/inventory/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Inventory item deleted successfully' });
      expect(inventoryService.getInventoryItemById).toHaveBeenCalledWith('1');
      expect(inventoryService.deleteInventoryItem).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deleting a non-existent inventory item', async () => {
      inventoryService.getInventoryItemById.mockResolvedValue(null);

      const response = await request(app).delete('/inventory/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Inventory item not found' });
    });

    it('should handle error when deleting an inventory item', async () => {
      inventoryService.getInventoryItemById.mockResolvedValue({ id: 1 });
      inventoryService.deleteInventoryItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/inventory/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});