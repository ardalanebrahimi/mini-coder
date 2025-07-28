import { Router } from "express";
import { StarController } from "../controllers/starController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/stars/{projectId}/toggle:
 *   post:
 *     summary: Toggle star for a project
 *     tags: [Stars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project ID to star/unstar
 *     responses:
 *       200:
 *         description: Star toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 starred:
 *                   type: boolean
 *                 starCount:
 *                   type: integer
 *                 projectId:
 *                   type: integer
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Project not found
 */
router.post("/:projectId/toggle", authenticateJWT, StarController.toggleStar);

/**
 * @swagger
 * /api/stars/{projectId}/status:
 *   get:
 *     summary: Get star status for a project
 *     tags: [Stars]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project ID to get star status for
 *     responses:
 *       200:
 *         description: Star status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 starred:
 *                   type: boolean
 *                 starCount:
 *                   type: integer
 *                 projectId:
 *                   type: integer
 *       404:
 *         description: Project not found
 */
router.get("/:projectId/status", StarController.getStarStatus);

export default router;
