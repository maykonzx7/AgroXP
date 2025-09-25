import prisma from '../services/database.service.js';

// Mock prisma
jest.mock('../services/database.service.js', () => ({
  __esModule: true,
  default: {
    farm: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

import * as farmService from '../services/farm.service.js';

describe('Farm Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFarm', () => {
    it('should create a new farm', async () => {
      const farmData = { name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 };
      const createdFarm = { id: 1, ...farmData };

      prisma.farm.create.mockResolvedValue(createdFarm);

      const result = await farmService.createFarm(farmData);

      expect(result).toEqual(createdFarm);
      expect(prisma.farm.create).toHaveBeenCalledWith({ data: farmData });
    });
  });

  describe('getAllFarms', () => {
    it('should return all farms', async () => {
      const mockFarms = [
        { id: 1, name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 },
        { id: 2, name: 'Sunset Farm', description: 'Vegetable farm', location: 'Oregon', size: 30.2, sizeUnit: 'acres', ownerId: 2 }
      ];

      prisma.farm.findMany.mockResolvedValue(mockFarms);

      const result = await farmService.getAllFarms();

      expect(result).toEqual(mockFarms);
      expect(prisma.farm.findMany).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('getFarmById', () => {
    it('should return a farm by id', async () => {
      const mockFarm = { id: 1, name: 'Green Acres', description: 'Organic farm', location: 'California', size: 50.5, sizeUnit: 'acres', ownerId: 1 };

      prisma.farm.findUnique.mockResolvedValue(mockFarm);

      const result = await farmService.getFarmById(1);

      expect(result).toEqual(mockFarm);
      expect(prisma.farm.findUnique).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return null if farm is not found', async () => {
      prisma.farm.findUnique.mockResolvedValue(null);

      const result = await farmService.getFarmById(999);

      expect(result).toBeNull();
      expect(prisma.farm.findUnique).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('updateFarm', () => {
    it('should update an existing farm', async () => {
      const farmData = { name: 'Updated Farm', description: 'Updated description', location: 'Updated location', size: 60.0, sizeUnit: 'acres' };
      const updatedFarm = { id: 1, ...farmData };

      prisma.farm.update.mockResolvedValue(updatedFarm);

      const result = await farmService.updateFarm(1, farmData);

      expect(result).toEqual(updatedFarm);
      expect(prisma.farm.update).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw an error if farm is not found', async () => {
      prisma.farm.update.mockRejectedValue(new Error('Record not found'));

      await expect(farmService.updateFarm(999, {})).rejects.toThrow('Farm not found');
      expect(prisma.farm.update).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('deleteFarm', () => {
    it('should delete an existing farm', async () => {
      prisma.farm.delete.mockResolvedValue();

      await expect(farmService.deleteFarm(1)).resolves.not.toThrow();
      expect(prisma.farm.delete).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw an error if farm is not found', async () => {
      prisma.farm.delete.mockRejectedValue(new Error('Record not found'));

      await expect(farmService.deleteFarm(999)).rejects.toThrow('Farm not found');
      expect(prisma.farm.delete).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});