import prisma from "./database.service.js";
import { v4 as uuidv4 } from "uuid";

// Create a user session (uses RefreshToken model in Prisma schema)
export const createSession = async (userId: string) => {
  const token = uuidv4();

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create the refresh token record
  const session = await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
    include: { user: true },
  });

  return session;
};

// Validate a session token and return the associated user (without password)
export const validateSession = async (token: string) => {
  // Find the refresh token by token string
  const session = await prisma.refreshToken.findFirst({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = session.user;
  return userWithoutPassword;
};

// Delete a session by token
export const deleteSession = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

export default {
  createSession,
  validateSession,
  deleteSession,
};
