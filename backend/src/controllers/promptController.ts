import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

/**
 * @swagger
 * /api/v1/prompts/generate:
 *   post:
 *     summary: Generate AI prompt (costs 1 token)
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input
 *             properties:
 *               input:
 *                 type: string
 *                 description: User input for prompt generation
 *               type:
 *                 type: string
 *                 enum: [basic, advanced, premium]
 *                 default: basic
 *                 description: Type of prompt generation
 *     responses:
 *       200:
 *         description: Prompt generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompt:
 *                   type: string
 *                   description: Generated prompt
 *                 tokensUsed:
 *                   type: integer
 *                   description: Number of tokens deducted
 *                 tokensRemaining:
 *                   type: integer
 *                   description: Remaining token balance
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of tokens
 */
export const generatePrompt = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { input, type = "basic" } = req.body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Input is required and must be a non-empty string" });
    }

    // Simulate AI prompt generation based on type
    let generatedPrompt: string;
    let tokensUsed = 1; // This was already deducted by the middleware

    switch (type) {
      case "basic":
        generatedPrompt = `Enhanced prompt: "${input}" - Please provide a detailed and creative response to this request.`;
        break;
      case "advanced":
        generatedPrompt = `Advanced prompt: "${input}" - Analyze this request from multiple perspectives and provide a comprehensive, well-structured response with examples and practical applications.`;
        break;
      case "premium":
        generatedPrompt = `Premium prompt: "${input}" - Provide an expert-level analysis of this request, including background context, detailed explanations, step-by-step guidance, potential challenges, best practices, and innovative solutions.`;
        break;
      default:
        generatedPrompt = `Standard prompt: "${input}" - Please respond to this request thoughtfully.`;
    }

    res.json({
      prompt: generatedPrompt,
      tokensUsed,
      tokensRemaining: req.user?.tokens || 0,
      metadata: {
        inputLength: input.length,
        promptType: type,
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * @swagger
 * /api/v1/prompts/preview:
 *   post:
 *     summary: Preview prompt generation cost (no token deduction)
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input
 *             properties:
 *               input:
 *                 type: string
 *                 description: User input for prompt generation
 *               type:
 *                 type: string
 *                 enum: [basic, advanced, premium]
 *                 default: basic
 *                 description: Type of prompt generation
 *     responses:
 *       200:
 *         description: Prompt preview with cost information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preview:
 *                   type: string
 *                   description: Preview of what would be generated
 *                 cost:
 *                   type: integer
 *                   description: Number of tokens this would cost
 *                 canAfford:
 *                   type: boolean
 *                   description: Whether user has enough tokens
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const previewPrompt = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { input, type = "basic" } = req.body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Input is required and must be a non-empty string" });
    }

    const cost = 1; // Basic cost for prompt generation
    const userTokens = req.user?.tokens || 0;

    res.json({
      preview: `This will generate a ${type} prompt based on: "${input.substring(
        0,
        50
      )}${input.length > 50 ? "..." : ""}"`,
      cost,
      canAfford: userTokens >= cost,
      currentTokens: userTokens,
      metadata: {
        inputLength: input.length,
        promptType: type,
      },
    });
  }
);
