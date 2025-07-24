import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getPublishedProjects,
} from "../controllers/projectController";

const router: Router = Router();

// Public routes
router.get("/published", getPublishedProjects);

// Protected routes (require authentication)
router.use(authenticateJWT);

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
