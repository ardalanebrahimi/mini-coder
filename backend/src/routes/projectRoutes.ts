import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getPublishedProjects,
  getAppStoreProjects,
  getPublicProject,
  publishProject,
  unpublishProject,
} from "../controllers/projectController";

const router: Router = Router();

// Public routes
router.get("/published", getPublishedProjects);
router.get("/app-store", getAppStoreProjects);
router.get("/public/:id", getPublicProject);

// Protected routes (require authentication)
router.use(authenticateJWT);

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Publish/unpublish routes
router.post("/:id/publish", publishProject);
router.post("/:id/unpublish", unpublishProject);

export default router;
