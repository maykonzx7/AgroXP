import Finance from '../modules/finance/Finance.model.js';
import * as financeService from '../services/finance.service.js';

// Mock the Finance model
jest.mock('../modules/finance/Finance.model.js', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Finance Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFinancialRecords', () => {
    it('should return all financial records', async () => {
      const mockRecords = [
        { id: 1, type: 'income', category: 'Sales', amount: 1000.00, description: 'Crop sale' },
        { id: 2, type: 'expense', category: 'Supplies', amount: 500.00, description: 'Fertilizer purchase' }
      ];

      Finance.findAll.mockResolvedValue(mockRecords);

      const result = await financeService.getAllFinancialRecords();

      expect(result).toEqual(mockRecords);
      expect(Finance.findAll).toHaveBeenCalled();
    });
  });

  describe('getFinancialRecordById', () => {
    it('should return a financial record by id', async () => {
      const mockRecord = { id: 1, type: 'income', category: 'Sales', amount: 1000.00, description: 'Crop sale' };

      Finance.findByPk.mockResolvedValue(mockRecord);

      const result = await financeService.getFinancialRecordById(1);

      expect(result).toEqual(mockRecord);
      expect(Finance.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return null if financial record is not found', async () => {
      Finance.findByPk.mockResolvedValue(null);

      const result = await financeService.getFinancialRecordById(999);

      expect(result).toBeNull();
      expect(Finance.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('createFinancialRecord', () => {
    it('should create a new financial record', async () => {
      const recordData = { type: 'expense', category: 'Equipment', amount: 2000.00, description: 'Tractor purchase' };
      const createdRecord = { id: 3, ...recordData };

      Finance.create.mockResolvedValue(createdRecord);

      const result = await financeService.createFinancialRecord(recordData);

      expect(result).toEqual(createdRecord);
      expect(Finance.create).toHaveBeenCalledWith(recordData);
    });
  });

  describe('updateFinancialRecord', () => {
    it('should update an existing financial record', async () => {
      const recordData = { type: 'income', category: 'Updated Sales', amount: 1500.00, description: 'Updated crop sale' };
      const updatedRecord = { id: 1, ...recordData };

      const mockRecord = {
        update: jest.fn().mockResolvedValue(updatedRecord)
      };

      Finance.findByPk.mockResolvedValue(mockRecord);

      const result = await financeService.updateFinancialRecord(1, recordData);

      expect(result).toEqual(updatedRecord);
      expect(Finance.findByPk).toHaveBeenCalledWith(1);
      expect(mockRecord.update).toHaveBeenCalledWith(recordData);
    });

    it('should throw an error if financial record is not found', async () => {
      Finance.findByPk.mockResolvedValue(null);

      await expect(financeService.updateFinancialRecord(999, {})).rejects.toThrow('Financial record not found');
      expect(Finance.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('deleteFinancialRecord', () => {
    it('should delete an existing financial record', async () => {
      const mockRecord = {
        destroy: jest.fn().mockResolvedValue()
      };

      Finance.findByPk.mockResolvedValue(mockRecord);

      await expect(financeService.deleteFinancialRecord(1)).resolves.not.toThrow();
      expect(Finance.findByPk).toHaveBeenCalledWith(1);
      expect(mockRecord.destroy).toHaveBeenCalled();
    });

    it('should throw an error if financial record is not found', async () => {
      Finance.findByPk.mockResolvedValue(null);

      await expect(financeService.deleteFinancialRecord(999)).rejects.toThrow('Financial record not found');
      expect(Finance.findByPk).toHaveBeenCalledWith(999);
    });
  });
});