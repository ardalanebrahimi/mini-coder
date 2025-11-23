import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import { requireTokens } from "../middleware/tokenDeduction";
import {
  generateMiniApp,
  modifyMiniApp,
  generateAppName,
  transcribeAudio,
} from "../controllers/miniCoderController";

const router: Router = Router();

// All Mini Coder routes require authentication
router.use(authenticateJWT);

/**
 * Generate a new mini app from user command
 * Costs: 2 tokens (includes app name generation)
 */
router.post(
  "/generate",
  requireTokens({ tokensRequired: 2 }),
  generateMiniApp
);

/**
 * Modify an existing mini app
 * Costs: 2 tokens
 */
router.post("/modify", requireTokens({ tokensRequired: 2 }), modifyMiniApp);

/**
 * Generate just an app name
 * Costs: 1 token
 */
router.post(
  "/app-name",
  requireTokens({ tokensRequired: 1 }),
  generateAppName
);

/**
 * Transcribe audio to text using Whisper
 * Costs: 1 token
 */
router.post(
  "/transcribe",
  requireTokens({ tokensRequired: 1 }),
  transcribeAudio
);

export default router;
