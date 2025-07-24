import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import { requireTokens } from "../middleware/tokenDeduction";
import {
  generateCode,
  getAvailableModels,
  checkAIHealth,
} from "../controllers/aiController";

const router: Router = Router();

// All AI routes require authentication
router.use(authenticateJWT);

// Health check endpoint (no token required)
router.get("/health", checkAIHealth);

// Get available models (no token required)
router.get("/models", getAvailableModels);

// Generate code endpoint (requires and deducts 1 token)
router.post("/generate", requireTokens({ tokensRequired: 1 }), generateCode);

export default router;
