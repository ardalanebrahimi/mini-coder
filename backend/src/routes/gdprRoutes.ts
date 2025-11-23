import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  exportUserData,
  deleteUserData,
  recordParentalConsent,
} from "../controllers/gdprController";

const router: Router = Router();

// All GDPR routes require authentication
router.use(authenticateJWT);

/**
 * GDPR Article 20: Right to Data Portability
 * Export all user data in machine-readable format
 */
router.get("/export", exportUserData);

/**
 * GDPR Article 17: Right to Erasure ("Right to be Forgotten")
 * Permanently delete user account and all associated data
 */
router.delete("/delete", deleteUserData);

/**
 * COPPA Compliance: Record parental consent
 * For users under 13 years old
 */
router.post("/consent", recordParentalConsent);

export default router;
