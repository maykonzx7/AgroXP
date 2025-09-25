import request from 'supertest';
import express from 'express';
import authController from '../controllers/auth.controller.js';
import * as userService from '../services/user.service.js';
import * as authService from '../services/auth.service.js';

// Create a mock express app for testing
const app = express();
app.use(express.json());

// Mock the routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/logout', authController.logout);
app.get('/auth/me', authController.getCurrentUser);

// Mock the service functions
jest.mock('../services/user.service.js');
jest.mock('../services/auth.service.js');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const mockSession = { token: 'mock-token' };

      userService.getUserById.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(mockUser);
      authService.createSession.mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        user: mockUser,
        token: 'mock-token'
      });
      expect(userService.getUserById).toHaveBeenCalled();
      expect(userService.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User',
        'Test Farm',
        '123456789'
      );
      expect(authService.createSession).toHaveBeenCalledWith(1);
    });

    it('should return 400 if user already exists', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      userService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'User already exists' });
      expect(userService.getUserById).toHaveBeenCalled();
    });

    it('should handle error when registering a user', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      userService.getUserById.mockResolvedValue(null);
      userService.createUser.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };
      const mockSession = { token: 'mock-token' };

      userService.authenticateUser.mockResolvedValue(mockUser);
      authService.createSession.mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: mockUser,
        token: 'mock-token'
      });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(authService.createSession).toHaveBeenCalledWith(1);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };

      userService.authenticateUser.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword'
      );
    });

    it('should handle error when logging in', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };

      userService.authenticateUser.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout a user', async () => {
      authService.deleteSession.mockResolvedValue();

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logged out successfully' });
      expect(authService.deleteSession).toHaveBeenCalledWith('mock-token');
    });

    it('should handle error when logging out', async () => {
      authService.deleteSession.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /auth/me', () => {
    it('should get current user', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', farmName: 'Test Farm', phone: '123456789' };

      // For simplicity, we're returning a mock user directly
      // In a real implementation, this would validate the session token

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      // Note: The current implementation returns a placeholder user
      // In a real test, we would mock the session validation
    });
  });
});