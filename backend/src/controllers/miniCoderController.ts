import { Response } from "express";
import {
  MiniCoderService,
  GenerateMiniAppRequest,
  ModifyMiniAppRequest,
  GenerateAppNameRequest,
} from "../services/miniCoderService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import multer from "multer";

const miniCoderService = new MiniCoderService();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept audio files
    if (
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "application/octet-stream"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

/**
 * @swagger
 * /ai/mini-coder/generate:
 *   post:
 *     summary: Generate a kid-friendly mini app (costs 2 tokens)
 *     tags: [Mini Coder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *               - detectedLanguage
 *             properties:
 *               command:
 *                 type: string
 *                 description: User's natural language command
 *                 example: "Create a fun calculator for kids"
 *               detectedLanguage:
 *                 type: string
 *                 enum: [en, de]
 *                 description: Detected language of the command
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Mini app generated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of tokens
 */
export const generateMiniApp = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { command, detectedLanguage } = req.body;

    // Validation
    if (!command || typeof command !== "string" || command.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Command is required and must be a non-empty string" });
    }

    if (!detectedLanguage || !["en", "de"].includes(detectedLanguage)) {
      return res.status(400).json({
        error: "detectedLanguage must be 'en' or 'de'",
      });
    }

    try {
      const request: GenerateMiniAppRequest = {
        command: command.trim(),
        detectedLanguage,
      };

      const result = await miniCoderService.generateMiniApp(request);

      return res.json({
        ...result,
        tokensRemaining: req.user.tokens,
        metadata: {
          userId: req.user.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Mini app generation error:", error);

      if (error instanceof Error) {
        return res.status(500).json({
          error: "Failed to generate mini app. Please try again.",
          details: error.message,
          code: "GENERATION_FAILED",
        });
      }

      return res.status(500).json({
        error: "Unknown error occurred during mini app generation",
        code: "UNKNOWN_ERROR",
      });
    }
  }
);

/**
 * @swagger
 * /ai/mini-coder/modify:
 *   post:
 *     summary: Modify an existing mini app (costs 2 tokens)
 *     tags: [Mini Coder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *               - currentAppCode
 *               - detectedLanguage
 *             properties:
 *               command:
 *                 type: string
 *                 description: Modification instruction
 *                 example: "Make the buttons bigger and add sound effects"
 *               currentAppCode:
 *                 type: string
 *                 description: Current app's HTML code
 *               currentAppName:
 *                 type: string
 *                 description: Current app name (preserved)
 *               detectedLanguage:
 *                 type: string
 *                 enum: [en, de]
 *     responses:
 *       200:
 *         description: Mini app modified successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Out of tokens
 */
export const modifyMiniApp = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { command, currentAppCode, currentAppName, detectedLanguage } =
      req.body;

    // Validation
    if (!command || typeof command !== "string" || command.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Command is required and must be a non-empty string" });
    }

    if (
      !currentAppCode ||
      typeof currentAppCode !== "string" ||
      currentAppCode.trim().length === 0
    ) {
      return res.status(400).json({
        error: "currentAppCode is required and must be a non-empty string",
      });
    }

    if (!detectedLanguage || !["en", "de"].includes(detectedLanguage)) {
      return res.status(400).json({
        error: "detectedLanguage must be 'en' or 'de'",
      });
    }

    try {
      const request: ModifyMiniAppRequest = {
        command: command.trim(),
        currentAppCode: currentAppCode.trim(),
        currentAppName: currentAppName?.trim(),
        detectedLanguage,
      };

      const result = await miniCoderService.modifyMiniApp(request);

      return res.json({
        ...result,
        tokensRemaining: req.user.tokens,
        metadata: {
          userId: req.user.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Mini app modification error:", error);

      if (error instanceof Error) {
        return res.status(500).json({
          error: "Failed to modify mini app. Please try again.",
          details: error.message,
          code: "MODIFICATION_FAILED",
        });
      }

      return res.status(500).json({
        error: "Unknown error occurred during mini app modification",
        code: "UNKNOWN_ERROR",
      });
    }
  }
);

/**
 * @swagger
 * /ai/mini-coder/app-name:
 *   post:
 *     summary: Generate a creative app name (costs 1 token)
 *     tags: [Mini Coder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *               - detectedLanguage
 *             properties:
 *               command:
 *                 type: string
 *               detectedLanguage:
 *                 type: string
 *                 enum: [en, de]
 *     responses:
 *       200:
 *         description: App name generated successfully
 */
export const generateAppName = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { command, detectedLanguage } = req.body;

    if (!command || !detectedLanguage) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const request: GenerateAppNameRequest = {
        command: command.trim(),
        detectedLanguage,
      };

      const appName = await miniCoderService.generateAppName(request);

      return res.json({
        appName,
        tokensRemaining: req.user.tokens,
      });
    } catch (error) {
      console.error("App name generation error:", error);
      return res.status(500).json({
        error: "Failed to generate app name",
        code: "NAME_GENERATION_FAILED",
      });
    }
  }
);

/**
 * @swagger
 * /ai/mini-coder/transcribe:
 *   post:
 *     summary: Transcribe audio to text using Whisper (costs 1 token)
 *     tags: [Mini Coder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (WebM, MP3, etc.)
 *     responses:
 *       200:
 *         description: Audio transcribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transcription:
 *                   type: string
 *                 tokensRemaining:
 *                   type: integer
 */
export const transcribeAudio = [
  upload.single("audio"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    try {
      const transcription = await miniCoderService.transcribeAudio({
        audioFile: req.file.buffer,
        mimeType: req.file.mimetype,
      });

      return res.json({
        transcription,
        tokensRemaining: req.user.tokens,
        metadata: {
          userId: req.user.id,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Audio transcription error:", error);
      return res.status(500).json({
        error: "Failed to transcribe audio. Please try again.",
        code: "TRANSCRIPTION_FAILED",
      });
    }
  }),
];
