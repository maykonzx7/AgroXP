import request from 'supertest';
import express from 'express';
import parcelController from '../controllers/parcel.controller.js';
import * as parcelService from '../services/parcel.service.js';

// Create a mock express app for testing
const app = express();
app.use(express.json());

// Mock the routes
app.get('/parcels', parcelController.getParcels);
app.get('/parcels/:id', parcelController.getParcelById);
app.post('/parcels', parcelController.createParcel);
app.put('/parcels/:id', parcelController.updateParcel);
app.delete('/parcels/:id', parcelController.deleteParcel);

// Mock the service functions
jest.mock('../services/parcel.service.js');

describe('Parcel Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /parcels', () => {
    it('should get all parcels', async () => {
      const mockParcels = [
        { id: 1, name: 'Parcel A', size: 10.5, location: 'North Field' },
        { id: 2, name: 'Parcel B', size: 15.2, location: 'South Field' }
      ];

      parcelService.getAllParcels.mockResolvedValue(mockParcels);

      const response = await request(app).get('/parcels');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockParcels);
      expect(parcelService.getAllParcels).toHaveBeenCalled();
    });

    it('should handle error when getting parcels', async () => {
      parcelService.getAllParcels.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/parcels');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /parcels/:id', () => {
    it('should get a parcel by id', async () => {
      const mockParcel = { id: 1, name: 'Parcel A', size: 10.5, location: 'North Field' };

      parcelService.getParcelById.mockResolvedValue(mockParcel);

      const response = await request(app).get('/parcels/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockParcel);
      expect(parcelService.getParcelById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when parcel is not found', async () => {
      parcelService.getParcelById.mockResolvedValue(null);

      const response = await request(app).get('/parcels/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Parcel not found' });
    });

    it('should handle error when getting a parcel', async () => {
      parcelService.getParcelById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/parcels/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /parcels', () => {
    it('should create a new parcel', async () => {
      const newParcel = { name: 'New Parcel', size: 20.0, location: 'East Field' };
      const createdParcel = { id: 3, ...newParcel };

      parcelService.createParcel.mockResolvedValue(createdParcel);

      const response = await request(app)
        .post('/parcels')
        .send(newParcel);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdParcel);
      expect(parcelService.createParcel).toHaveBeenCalledWith(newParcel);
    });

    it('should handle error when creating a parcel', async () => {
      const newParcel = { name: 'New Parcel', size: 20.0, location: 'East Field' };

      parcelService.createParcel.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/parcels')
        .send(newParcel);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });

  describe('PUT /parcels/:id', () => {
    it('should update a parcel', async () => {
      const updatedParcel = { id: 1, name: 'Updated Parcel', size: 25.0, location: 'West Field' };

      parcelService.getParcelById.mockResolvedValue({ id: 1 });
      parcelService.updateParcel.mockResolvedValue(updatedParcel);

      const response = await request(app)
        .put('/parcels/1')
        .send({ name: 'Updated Parcel', size: 25.0, location: 'West Field' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedParcel);
      expect(parcelService.getParcelById).toHaveBeenCalledWith('1');
      expect(parcelService.updateParcel).toHaveBeenCalledWith('1', {
        name: 'Updated Parcel',
        size: 25.0,
        location: 'West Field'
      });
    });

    it('should return 404 when updating a non-existent parcel', async () => {
      parcelService.getParcelById.mockResolvedValue(null);

      const response = await request(app)
        .put('/parcels/999')
        .send({ name: 'Updated Parcel', size: 25.0, location: 'West Field' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Parcel not found' });
    });

    it('should handle error when updating a parcel', async () => {
      parcelService.getParcelById.mockResolvedValue({ id: 1 });
      parcelService.updateParcel.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/parcels/1')
        .send({ name: 'Updated Parcel', size: 25.0, location: 'West Field' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });

  describe('DELETE /parcels/:id', () => {
    it('should delete a parcel', async () => {
      parcelService.getParcelById.mockResolvedValue({ id: 1 });
      parcelService.deleteParcel.mockResolvedValue();

      const response = await request(app).delete('/parcels/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Parcel deleted successfully' });
      expect(parcelService.getParcelById).toHaveBeenCalledWith('1');
      expect(parcelService.deleteParcel).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deleting a non-existent parcel', async () => {
      parcelService.getParcelById.mockResolvedValue(null);

      const response = await request(app).delete('/parcels/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Parcel not found' });
    });

    it('should handle error when deleting a parcel', async () => {
      parcelService.getParcelById.mockResolvedValue({ id: 1 });
      parcelService.deleteParcel.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/parcels/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});