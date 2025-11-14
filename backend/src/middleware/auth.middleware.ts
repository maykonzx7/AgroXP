import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service.js";

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Allow bypass in development by setting SKIP_AUTH_DEV=true
    if (process.env.SKIP_AUTH_DEV === "true") {
      // attach a dummy user for convenience in dev
      (req as any).user = {
        id: "dev-user",
        email: "dev@local",
        name: "Dev User",
      };
      return next();
    }
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate the session
    const user = await authService.validateSession(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Attach the user to the request object
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { authenticate };
