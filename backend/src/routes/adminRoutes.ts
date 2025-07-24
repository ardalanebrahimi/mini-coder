import express from "express";
import { authenticateJWT } from "../middleware/auth";
import { getAdminStats } from "../controllers/adminController";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateJWT);

// Admin statistics endpoint
router.get("/", getAdminStats);

export default router;
