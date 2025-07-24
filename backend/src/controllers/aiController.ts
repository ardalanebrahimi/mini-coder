import { Response } from "express";
import { AIService, GenerateCodeRequest } from "../services/aiService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

const aiService = new AIService();

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     summary: Generate code using AI (costs 1 token)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of the code to generate
 *                 example: "Create a function to calculate fibonacci numbers"
 *               language:
 *                 type: string
 *                 description: Programming language for the generated code
 *                 example: "javascript"
 *               context:
 *                 type: string
 *                 description: Additional context or requirements
 *                 example: "Make it recursive and add error handling"
 *               maxTokens:
 *                 type: integer
 *                 minimum: 100
 *                 maximum: 4000
 *                 default: 2000
 *                 description: Maximum tokens to generate
 *               temperature:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2
 *                 default: 0.7
 *                 description: Creativity level (0 = deterministic, 2 = very creative)
 *     responses:
 *       200:
 *         description: Code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generatedCode:
 *                   type: string
 *                   description: The AI-generated code
 *                 usage:
 *                   type: object
 *                   properties:
 *                     promptTokens:
 *                       type: integer
 *                     completionTokens:
 *                       type: integer
 *                     totalTokens:
 *                       type: integer
 *                 model:
 *                   type: string
 *                   description: The AI model used
 *                 finishReason:
 *                   type: string
 *                   description: Why the generation stopped
 *                 tokensRemaining:
 *                   type: integer
 *                   description: User's remaining token balance
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of tokens
 *       500:
 *         description: AI generation failed
 */
export const generateCode = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { prompt, language, context, maxTokens, temperature } = req.body;

    // Validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Prompt is required and must be a non-empty string" });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({
        error: "Prompt is too long. Maximum 4000 characters allowed.",
      });
    }

    if (
      language &&
      (typeof language !== "string" || language.trim().length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "Language must be a non-empty string if provided" });
    }

    if (
      maxTokens &&
      (typeof maxTokens !== "number" || maxTokens < 100 || maxTokens > 4000)
    ) {
      return res
        .status(400)
        .json({ error: "maxTokens must be a number between 100 and 4000" });
    }

    if (
      temperature &&
      (typeof temperature !== "number" || temperature < 0 || temperature > 2)
    ) {
      return res
        .status(400)
        .json({ error: "temperature must be a number between 0 and 2" });
    }

    try {
      // Build the request for AI service
      const aiRequest: GenerateCodeRequest = {
        prompt: prompt.trim(),
        language: language?.trim(),
        context: context?.trim(),
        maxTokens,
        temperature,
      };

      // Generate code using AI service
      const result = await aiService.generateCode(aiRequest);

      // Return the generated code along with metadata
      return res.json({
        ...result,
        tokensRemaining: req.user.tokens, // This was already decremented by middleware
        metadata: {
          userId: req.user.id,
          timestamp: new Date().toISOString(),
          request: {
            promptLength: prompt.length,
            language: language || "not specified",
            hasContext: !!context,
          },
        },
      });
    } catch (error) {
      console.error("AI generation error:", error);

      if (error instanceof Error) {
        // Return specific error messages for different failure types
        if (
          error.message.includes("quota") ||
          error.message.includes("billing")
        ) {
          return res.status(503).json({
            error: "AI service temporarily unavailable due to quota limits",
            code: "QUOTA_EXCEEDED",
          });
        }

        if (error.message.includes("rate_limit")) {
          return res.status(429).json({
            error: "AI service rate limit exceeded. Please try again later.",
            code: "RATE_LIMITED",
          });
        }

        if (error.message.includes("invalid_api_key")) {
          return res.status(500).json({
            error: "AI service configuration error",
            code: "CONFIG_ERROR",
          });
        }

        return res.status(500).json({
          error: "Failed to generate code. Please try again.",
          details: error.message,
          code: "GENERATION_FAILED",
        });
      }

      return res.status(500).json({
        error: "Unknown error occurred during code generation",
        code: "UNKNOWN_ERROR",
      });
    }
  }
);

/**
 * @swagger
 * /ai/models:
 *   get:
 *     summary: Get available AI models
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available AI models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Available AI models
 *       401:
 *         description: Unauthorized
 */
export const getAvailableModels = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const models = await aiService.getAvailableModels();
      return res.json({ models });
    } catch (error) {
      console.error("Failed to fetch available models:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch available models" });
    }
  }
);

/**
 * @swagger
 * /ai/health:
 *   get:
 *     summary: Check AI service health
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 apiKeyValid:
 *                   type: boolean
 *       500:
 *         description: AI service is not healthy
 */
export const checkAIHealth = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const isValid = await aiService.validateApiKey();

      if (isValid) {
        return res.json({
          status: "healthy",
          apiKeyValid: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(500).json({
          status: "unhealthy",
          apiKeyValid: false,
          error: "Invalid or missing OpenAI API key",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "unhealthy",
        apiKeyValid: false,
        error: "Failed to validate AI service",
        timestamp: new Date().toISOString(),
      });
    }
  }
);
