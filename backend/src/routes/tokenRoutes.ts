import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  getTokenBalanceController,
  addTokensController,
  getTokenUsageController,
} from "../controllers/tokenController";

const router: Router = Router();

// All token routes require authentication
router.use(authenticateJWT);

// Token balance and management routes
router.get("/balance", getTokenBalanceController);
router.post("/add", addTokensController);
router.get("/usage", getTokenUsageController);

export default router;
