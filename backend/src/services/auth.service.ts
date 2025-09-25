import prisma from './database.service.js';
import { v4 as uuidv4 } from 'uuid';

// Create a user session
export const createSession = async (userId: number) => {
  // Generate a unique token
  const token = uuidv4();
  
  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Create the session in the database
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return session;
};

// Validate a session token
export const validateSession = async (token: string) => {
  // Find the session by token
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  // If session doesn't exist or is expired, return null
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  // Return the user
  const { password: _, ...userWithoutPassword } = session.user;
  return userWithoutPassword;
};

// Delete a session
export const deleteSession = async (token: string) => {
  await prisma.session.delete({
    where: { token },
  });
};

export default {
  createSession,
  validateSession,
  deleteSession,
};