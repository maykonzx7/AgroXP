import * as authService from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

// Mock the auth service
jest.mock('../services/auth.service.js');

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should call next() for valid token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      
      mockRequest.headers.authorization = 'Bearer valid-token';
      authService.validateSession.mockResolvedValue(mockUser);

      await authenticate(mockRequest, mockResponse, mockNext);

      expect(authService.validateSession).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      await authenticate(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      authService.validateSession.mockResolvedValue(null);

      await authenticate(mockRequest, mockResponse, mockNext);

      expect(authService.validateSession).toHaveBeenCalledWith('invalid-token');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired session' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 for internal server error', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';
      authService.validateSession.mockRejectedValue(new Error('Database error'));

      await authenticate(mockRequest, mockResponse, mockNext);

      expect(authService.validateSession).toHaveBeenCalledWith('valid-token');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});