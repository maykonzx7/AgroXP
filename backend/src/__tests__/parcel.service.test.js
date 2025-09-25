import * as parcelService from '../services/parcel.service.js';
import { Parcel } from '../associations.js';

// Mock the Parcel model
jest.mock('../associations.js', () => ({
  Parcel: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Parcel Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllParcels', () => {
    it('should return all parcels', async () => {
      const mockParcels = [
        { id: 1, name: 'Parcel A', size: 10.5, location: 'North Field' },
        { id: 2, name: 'Parcel B', size: 15.2, location: 'South Field' }
      ];

      Parcel.findAll.mockResolvedValue(mockParcels);

      const result = await parcelService.getAllParcels();

      expect(result).toEqual(mockParcels);
      expect(Parcel.findAll).toHaveBeenCalled();
    });
  });

  describe('getParcelById', () => {
    it('should return a parcel by id', async () => {
      const mockParcel = { id: 1, name: 'Parcel A', size: 10.5, location: 'North Field' };

      Parcel.findByPk.mockResolvedValue(mockParcel);

      const result = await parcelService.getParcelById(1);

      expect(result).toEqual(mockParcel);
      expect(Parcel.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should return null if parcel is not found', async () => {
      Parcel.findByPk.mockResolvedValue(null);

      const result = await parcelService.getParcelById(999);

      expect(result).toBeNull();
      expect(Parcel.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    });
  });

  describe('createParcel', () => {
    it('should create a new parcel', async () => {
      const parcelData = { name: 'New Parcel', size: 20.0, location: 'East Field' };
      const createdParcel = { id: 3, ...parcelData };

      Parcel.create.mockResolvedValue(createdParcel);

      const result = await parcelService.createParcel(parcelData);

      expect(result).toEqual(createdParcel);
      expect(Parcel.create).toHaveBeenCalledWith(parcelData);
    });
  });

  describe('updateParcel', () => {
    it('should update an existing parcel', async () => {
      const parcelData = { name: 'Updated Parcel', size: 25.0, location: 'West Field' };
      const updatedParcel = { id: 1, ...parcelData };

      const mockParcel = {
        update: jest.fn().mockResolvedValue(updatedParcel)
      };

      Parcel.findByPk.mockResolvedValue(mockParcel);

      const result = await parcelService.updateParcel(1, parcelData);

      expect(result).toEqual(updatedParcel);
      expect(Parcel.findByPk).toHaveBeenCalledWith(1);
      expect(mockParcel.update).toHaveBeenCalledWith(parcelData);
    });

    it('should throw an error if parcel is not found', async () => {
      Parcel.findByPk.mockResolvedValue(null);

      await expect(parcelService.updateParcel(999, {})).rejects.toThrow('Parcel not found');
      expect(Parcel.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('deleteParcel', () => {
    it('should delete an existing parcel', async () => {
      const mockParcel = {
        destroy: jest.fn().mockResolvedValue()
      };

      Parcel.findByPk.mockResolvedValue(mockParcel);

      await expect(parcelService.deleteParcel(1)).resolves.not.toThrow();
      expect(Parcel.findByPk).toHaveBeenCalledWith(1);
      expect(mockParcel.destroy).toHaveBeenCalled();
    });

    it('should throw an error if parcel is not found', async () => {
      Parcel.findByPk.mockResolvedValue(null);

      await expect(parcelService.deleteParcel(999)).rejects.toThrow('Parcel not found');
      expect(Parcel.findByPk).toHaveBeenCalledWith(999);
    });
  });
});