import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name?: string | null;
    tokens: number;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
      res.status(500).json({ error: "JWT secret not configured" });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    console.error("JWT authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const generateToken = (userId: number, email: string): string => {
  const jwtSecret = process.env["JWT_SECRET"];
  const expiresIn = process.env["JWT_EXPIRES_IN"] || "7d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return jwt.sign({ userId, email } as JwtPayload, jwtSecret, {
    expiresIn,
  } as jwt.SignOptions);
};

/**
 * Optional authentication middleware - attaches user if token is valid, but doesn't require authentication
 * Useful for endpoints that should work for both authenticated and non-authenticated users
 */
export const optionalAuthentication = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    // If no token provided, continue without user
    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
      console.error("JWT secret not configured");
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user (don't return error)
    console.error("Optional authentication error:", error);
    next();
  }
};
