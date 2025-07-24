import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { addTokens, getTokenBalance } from "../middleware/tokenDeduction";

/**
 * @swagger
 * /api/v1/tokens/balance:
 *   get:
 *     summary: Get current token balance
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current token balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: integer
 *                   description: Current token count
 *                 userId:
 *                   type: integer
 *                   description: User ID
 *       401:
 *         description: Unauthorized
 */
export const getTokenBalanceController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const tokens = await getTokenBalance(req.user.id);

    res.json({
      tokens,
      userId: req.user.id,
    });
  }
);

/**
 * @swagger
 * /api/v1/tokens/add:
 *   post:
 *     summary: Add tokens to user account (admin only for now)
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokens
 *             properties:
 *               tokens:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of tokens to add
 *     responses:
 *       200:
 *         description: Tokens added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const addTokensController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { tokens } = req.body;

    if (!tokens || tokens < 1 || !Number.isInteger(tokens)) {
      return res
        .status(400)
        .json({ error: "Invalid token amount. Must be a positive integer." });
    }

    // In a real application, you might want to restrict this to admin users
    // For now, we'll allow users to add tokens to their own account
    const updatedUser = await addTokens(req.user.id, tokens);

    res.json({
      message: `Successfully added ${tokens} tokens`,
      user: updatedUser,
    });
  }
);

/**
 * @swagger
 * /api/v1/tokens/usage:
 *   get:
 *     summary: Get token usage statistics (placeholder for future implementation)
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token usage statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feature:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
export const getTokenUsageController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Placeholder for future token usage analytics
    res.json({
      message: "Token usage analytics coming soon",
      feature: "future-implementation",
    });
  }
);
