import prisma from '../services/database.service.js';
import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';

// Mock prisma
jest.mock('../services/database.service.js', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn()
    }
  }
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const hashedPassword = 'hashed-password';
      const createdUser = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await userService.createUser(
        'test@example.com',
        'password123',
        'Test User',
        'Test Farm',
        '123456789'
      );

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User',
          farmName: 'Test Farm',
          phone: '123456789'
        }
      });
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate a user with valid credentials', async () => {
      const userWithPassword = { id: 1, email: 'test@example.com', password: 'hashed-password', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const userWithoutPassword = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      prisma.user.findUnique.mockResolvedValue(userWithPassword);
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.authenticateUser('test@example.com', 'password123');

      expect(result).toEqual(userWithoutPassword);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should return null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.authenticateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
    });

    it('should return null for invalid password', async () => {
      const userWithPassword = { id: 1, email: 'test@example.com', password: 'hashed-password', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      prisma.user.findUnique.mockResolvedValue(userWithPassword);
      bcrypt.compare.mockResolvedValue(false);

      const result = await userService.authenticateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userWithPassword = { id: 1, email: 'test@example.com', password: 'hashed-password', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const userWithoutPassword = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      prisma.user.findUnique.mockResolvedValue(userWithPassword);

      const result = await userService.getUserById(1);

      expect(result).toEqual(userWithoutPassword);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should return null if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userData = { name: 'Updated User', farmName: 'Updated Farm', phone: '987654321' };
      const updatedUser = { id: 1, email: 'test@example.com', ...userData };

      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, userData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: userData
      });
    });
  });
});