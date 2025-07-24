import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthenticatedRequest } from "./auth";

export interface TokenDeductionOptions {
  tokensRequired?: number;
  skipDeduction?: boolean;
}

/**
 * Middleware to check and deduct tokens from authenticated users
 * @param options Configuration options for token deduction
 * @returns Express middleware function
 */
export const requireTokens = (options: TokenDeductionOptions = {}) => {
  const { tokensRequired = 1, skipDeduction = false } = options;

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const userId = req.user.id;

      // Get current user's token count from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokens: true, email: true },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Check if user has enough tokens
      if (user.tokens < tokensRequired) {
        res.status(403).json({
          error: "Out of tokens",
          tokensRequired,
          tokensAvailable: user.tokens,
          message: `You need ${tokensRequired} token(s) but only have ${user.tokens}`,
        });
        return;
      }

      // Deduct tokens if not skipping deduction
      if (!skipDeduction) {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { tokens: user.tokens - tokensRequired },
          select: { tokens: true },
        });

        // Update the request user object with new token count
        req.user.tokens = updatedUser.tokens;

        // Add token info to response headers for frontend tracking
        res.setHeader("X-Tokens-Remaining", updatedUser.tokens.toString());
        res.setHeader("X-Tokens-Deducted", tokensRequired.toString());
      }

      next();
    } catch (error) {
      console.error("Token deduction middleware error:", error);
      res.status(500).json({ error: "Failed to process token deduction" });
    }
  };
};

/**
 * Middleware that only checks tokens without deducting them
 * Useful for previewing costs before actual operations
 */
export const checkTokens = (tokensRequired: number = 1) => {
  return requireTokens({ tokensRequired, skipDeduction: true });
};

/**
 * Helper function to manually deduct tokens (for use in services)
 * @param userId User ID to deduct tokens from
 * @param tokens Number of tokens to deduct
 * @returns Updated user with new token count
 */
export const deductTokens = async (userId: number, tokens: number = 1) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: {
        decrement: tokens,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      tokens: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Helper function to add tokens to a user (for admin operations or purchases)
 * @param userId User ID to add tokens to
 * @param tokens Number of tokens to add
 * @returns Updated user with new token count
 */
export const addTokens = async (userId: number, tokens: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: {
        increment: tokens,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      tokens: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Get current token balance for a user
 * @param userId User ID to check
 * @returns Current token count
 */
export const getTokenBalance = async (userId: number): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true },
  });

  return user?.tokens ?? 0;
};
