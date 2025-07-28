import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  checkAvailability,
} from "../controllers/authController";
import { authenticateJWT } from "../middleware/auth";

const router: Router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/check-availability", checkAvailability);

// Protected routes
router.get("/me", authenticateJWT, getCurrentUser);

export default router;
