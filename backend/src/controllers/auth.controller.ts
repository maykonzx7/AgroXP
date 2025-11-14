import { Request, Response } from "express";
import userService from "../services/user.service.js";
import authService from "../services/auth.service.js";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, farmName, phone } = req.body;

    // Check if user already exists by email
    const existingUser = await userService.getUserByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create the user
    const user = await userService.createUser(
      email,
      password,
      name,
      farmName,
      phone
    );

    // Create a session for the user (Prisma ids are strings)
    const session = await authService.createSession(String(user.id));

    // Return the user and session token
    res.status(201).json({ user, token: session.token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Authenticate the user
    const user = await userService.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create a session for the user
    const session = await authService.createSession(String(user.id));

    // Return the user and session token
    res.json({ user, token: session.token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout a user
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await authService.deleteSession(token);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Get the current user from the session token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const user = await authService.validateSession(token);
    if (!user)
      return res.status(401).json({ error: "Invalid or expired session" });

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
