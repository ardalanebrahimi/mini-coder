import express from "express";
import { AnalyticsController } from "../controllers/analyticsController";
import { authenticateJWT } from "../middleware/auth";

const router = express.Router();

/**
 * Analytics Routes
 *
 * Public routes:
 * - POST /events - Receive analytics events from frontend
 * - GET /health - Health check
 *
 * Admin routes (require authentication and admin role):
 * - GET /stats - Get analytics statistics
 * - GET /events - Get analytics events (paginated)
 * - DELETE /events - Clear old analytics events
 */

// Public routes
router.post("/events", AnalyticsController.receiveEvents);
router.get("/health", AnalyticsController.healthCheck);

// Admin routes (require authentication)
router.get("/stats", authenticateJWT, AnalyticsController.getStats);
router.get("/events", authenticateJWT, AnalyticsController.getEvents);
router.delete("/events", authenticateJWT, AnalyticsController.clearOldEvents);

export default router;
