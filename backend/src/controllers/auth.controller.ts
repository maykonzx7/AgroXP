import { Request, Response } from 'express';
import userService from '../services/user.service.js';
import authService from '../services/auth.service.js';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, farmName, phone } = req.body;
    
    // Check if user already exists by email
    const existingUser = await userService.getUserByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create the user
    const user = await userService.createUser(email, password, name, farmName, phone);
    
    // Create a session for the user
    const session = await authService.createSession(user.id);
    
    // Return the user and session token
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, farmName: user.farmName, phone: user.phone },
      token: session.token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate the user
    const user = await userService.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create a session for the user
    const session = await authService.createSession(user.id);
    
    // Return the user and session token
    res.json({
      user: { id: user.id, email: user.email, name: user.name, farmName: user.farmName, phone: user.phone },
      token: session.token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout a user
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await authService.deleteSession(token);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we would get the user from the session
    // const token = req.headers.authorization?.split(' ')[1];
    // const user = await authService.validateSession(token);
    
    // For now, we'll return a placeholder
    res.json({ 
      id: 1, 
      email: 'farmer@example.com', 
      name: 'Farmer John', 
      farmName: 'Green Acres Farm',
      phone: '(11) 99999-9999'
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};