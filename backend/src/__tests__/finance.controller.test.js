import request from 'supertest';
import express from 'express';
import financeController from '../controllers/finance.controller.js';
import * as financeService from '../services/finance.service.js';

// Create a mock express app for testing
const app = express();
app.use(express.json());

// Mock the routes
app.get('/finance', financeController.getFinancialRecords);
app.get('/finance/:id', financeController.getFinancialRecordById);
app.post('/finance', financeController.createFinancialRecord);
app.put('/finance/:id', financeController.updateFinancialRecord);
app.delete('/finance/:id', financeController.deleteFinancialRecord);

// Mock the service functions
jest.mock('../services/finance.service.js');

describe('Finance Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /finance', () => {
    it('should get all financial records', async () => {
      const mockRecords = [
        { id: 1, type: 'income', category: 'Sales', amount: 1000.00, description: 'Crop sale' },
        { id: 2, type: 'expense', category: 'Supplies', amount: 500.00, description: 'Fertilizer purchase' }
      ];

      financeService.getAllFinancialRecords.mockResolvedValue(mockRecords);

      const response = await request(app).get('/finance');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecords);
      expect(financeService.getAllFinancialRecords).toHaveBeenCalled();
    });

    it('should handle error when getting financial records', async () => {
      financeService.getAllFinancialRecords.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/finance');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /finance/:id', () => {
    it('should get a financial record by id', async () => {
      const mockRecord = { id: 1, type: 'income', category: 'Sales', amount: 1000.00, description: 'Crop sale' };

      financeService.getFinancialRecordById.mockResolvedValue(mockRecord);

      const response = await request(app).get('/finance/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecord);
      expect(financeService.getFinancialRecordById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when financial record is not found', async () => {
      financeService.getFinancialRecordById.mockResolvedValue(null);

      const response = await request(app).get('/finance/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Financial record not found' });
    });

    it('should handle error when getting a financial record', async () => {
      financeService.getFinancialRecordById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/finance/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /finance', () => {
    it('should create a new financial record', async () => {
      const newRecord = { type: 'expense', category: 'Equipment', amount: 2000.00, description: 'Tractor purchase' };
      const createdRecord = { id: 3, ...newRecord };

      financeService.createFinancialRecord.mockResolvedValue(createdRecord);

      const response = await request(app)
        .post('/finance')
        .send(newRecord);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdRecord);
      expect(financeService.createFinancialRecord).toHaveBeenCalledWith(newRecord);
    });

    it('should handle error when creating a financial record', async () => {
      const newRecord = { type: 'expense', category: 'Equipment', amount: 2000.00, description: 'Tractor purchase' };

      financeService.createFinancialRecord.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/finance')
        .send(newRecord);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });

  describe('PUT /finance/:id', () => {
    it('should update a financial record', async () => {
      const updatedRecord = { id: 1, type: 'income', category: 'Updated Sales', amount: 1500.00, description: 'Updated crop sale' };

      financeService.getFinancialRecordById.mockResolvedValue({ id: 1 });
      financeService.updateFinancialRecord.mockResolvedValue(updatedRecord);

      const response = await request(app)
        .put('/finance/1')
        .send({ type: 'income', category: 'Updated Sales', amount: 1500.00, description: 'Updated crop sale' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedRecord);
      expect(financeService.getFinancialRecordById).toHaveBeenCalledWith('1');
      expect(financeService.updateFinancialRecord).toHaveBeenCalledWith('1', {
        type: 'income',
        category: 'Updated Sales',
        amount: 1500.00,
        description: 'Updated crop sale'
      });
    });

    it('should return 404 when updating a non-existent financial record', async () => {
      financeService.getFinancialRecordById.mockResolvedValue(null);

      const response = await request(app)
        .put('/finance/999')
        .send({ type: 'income', category: 'Updated Sales', amount: 1500.00, description: 'Updated crop sale' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Financial record not found' });
    });

    it('should handle error when updating a financial record', async () => {
      financeService.getFinancialRecordById.mockResolvedValue({ id: 1 });
      financeService.updateFinancialRecord.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/finance/1')
        .send({ type: 'income', category: 'Updated Sales', amount: 1500.00, description: 'Updated crop sale' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });

  describe('DELETE /finance/:id', () => {
    it('should delete a financial record', async () => {
      financeService.getFinancialRecordById.mockResolvedValue({ id: 1 });
      financeService.deleteFinancialRecord.mockResolvedValue();

      const response = await request(app).delete('/finance/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Financial record deleted successfully' });
      expect(financeService.getFinancialRecordById).toHaveBeenCalledWith('1');
      expect(financeService.deleteFinancialRecord).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deleting a non-existent financial record', async () => {
      financeService.getFinancialRecordById.mockResolvedValue(null);

      const response = await request(app).delete('/finance/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Financial record not found' });
    });

    it('should handle error when deleting a financial record', async () => {
      financeService.getFinancialRecordById.mockResolvedValue({ id: 1 });
      financeService.deleteFinancialRecord.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/finance/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});