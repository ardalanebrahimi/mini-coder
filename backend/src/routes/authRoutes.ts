import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  checkAvailability,
  getProfile,
  updateProfile,
  googleAuth,
  googleCallback,
} from "../controllers/authController";
import { authenticateJWT } from "../middleware/auth";

const router: Router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/check-availability", checkAvailability);

// Google OAuth routes
router.get("/google", googleAuth);
router.post("/google/callback", googleCallback);

// Protected routes
router.get("/me", authenticateJWT, getCurrentUser);
router.get("/profile", authenticateJWT, getProfile);
router.patch("/profile", authenticateJWT, updateProfile);

export default router;
