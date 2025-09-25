import request from 'supertest';
import express from 'express';
import farmController from '../controllers/farm.controller.js';
import * as farmService from '../services/farm.service.js';

// Create a mock express app for testing
const app = express();
app.use(express.json());

// Mock the routes
app.post('/farms', farmController.createFarm);
app.get('/farms', farmController.getFarms);
app.get('/farms/:id', farmController.getFarmById);
app.put('/farms/:id', farmController.updateFarm);
app.delete('/farms/:id', farmController.deleteFarm);

// Mock the service functions
jest.mock('../services/farm.service.js');

describe('Farm Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /farms', () => {
    it('should create a new farm', async () => {
      const newFarm = { name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 };
      const createdFarm = { id: 1, ...newFarm };

      farmService.createFarm.mockResolvedValue(createdFarm);

      const response = await request(app)
        .post('/farms')
        .send(newFarm);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdFarm);
      expect(farmService.createFarm).toHaveBeenCalledWith(newFarm);
    });

    it('should handle error when creating a farm', async () => {
      const newFarm = { name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 };

      farmService.createFarm.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/farms')
        .send(newFarm);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /farms', () => {
    it('should get all farms', async () => {
      const mockFarms = [
        { id: 1, name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 },
        { id: 2, name: 'Sunset Farm', description: 'Vegetable farm', location: 'Oregon', size: 30.2, sizeUnit: 'acres', ownerId: 2 }
      ];

      farmService.getAllFarms.mockResolvedValue(mockFarms);

      const response = await request(app).get('/farms');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFarms);
      expect(farmService.getAllFarms).toHaveBeenCalled();
    });

    it('should handle error when getting farms', async () => {
      farmService.getAllFarms.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/farms');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /farms/:id', () => {
    it('should get a farm by id', async () => {
      const mockFarm = { id: 1, name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 };

      farmService.getFarmById.mockResolvedValue(mockFarm);

      const response = await request(app).get('/farms/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFarm);
      expect(farmService.getFarmById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when farm is not found', async () => {
      farmService.getFarmById.mockResolvedValue(null);

      const response = await request(app).get('/farms/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Farm not found' });
    });

    it('should handle error when getting a farm', async () => {
      farmService.getFarmById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/farms/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PUT /farms/:id', () => {
    it('should update a farm', async () => {
      const updatedFarm = { id: 1, name: 'Updated Farm', description: 'Updated description', location: 'Updated location', size: 60.0, sizeUnit: 'acres' };

      farmService.updateFarm.mockResolvedValue(updatedFarm);

      const response = await request(app)
        .put('/farms/1')
        .send({ name: 'Updated Farm', description: 'Updated description', location: 'Updated location', size: 60.0, sizeUnit: 'acres' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedFarm);
      expect(farmService.updateFarm).toHaveBeenCalledWith('1', {
        name: 'Updated Farm',
        description: 'Updated description',
        location: 'Updated location',
        size: 60.0,
        sizeUnit: 'acres'
      });
    });

    it('should handle error when updating a farm', async () => {
      farmService.updateFarm.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/farms/1')
        .send({ name: 'Updated Farm', description: 'Updated description', location: 'Updated location', size: 60.0, sizeUnit: 'acres' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('DELETE /farms/:id', () => {
    it('should delete a farm', async () => {
      farmService.deleteFarm.mockResolvedValue();

      const response = await request(app).delete('/farms/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Farm deleted successfully' });
      expect(farmService.deleteFarm).toHaveBeenCalledWith('1');
    });

    it('should handle error when deleting a farm', async () => {
      farmService.deleteFarm.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/farms/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});