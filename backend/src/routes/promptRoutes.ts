import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import { requireTokens, checkTokens } from "../middleware/tokenDeduction";
import { generatePrompt, previewPrompt } from "../controllers/promptController";

const router: Router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Preview route - check tokens but don't deduct
router.post("/preview", checkTokens(1), previewPrompt);

// Generate route - requires and deducts 1 token
router.post("/generate", requireTokens({ tokensRequired: 1 }), generatePrompt);

export default router;
