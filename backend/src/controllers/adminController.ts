import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../config/database";

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get admin dashboard statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: integer
 *                   description: Total number of users
 *                   example: 3
 *                 projects:
 *                   type: integer
 *                   description: Total number of projects
 *                   example: 12
 *                 totalTokensUsed:
 *                   type: integer
 *                   description: Total tokens consumed across all users
 *                   example: 250
 *                 adminEmail:
 *                   type: string
 *                   description: Current admin email
 *                 timestamp:
 *                   type: string
 *                   description: Current timestamp
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const getAdminStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Check if user is admin
    const adminEmail = process.env["ADMIN_EMAIL"];
    if (!adminEmail) {
      res.status(500).json({
        error: "Admin email not configured",
        code: "ADMIN_CONFIG_MISSING",
      });
      return;
    }

    if (req.user.email !== adminEmail) {
      res.status(403).json({
        error: "Admin access required",
        code: "ADMIN_ACCESS_DENIED",
      });
      return;
    }

    try {
      // Get statistics from database
      const [userCount, projectCount, users] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.user.findMany({
          select: {
            tokens: true,
          },
        }),
      ]);

      // Calculate total tokens used (assuming users start with 100 tokens)
      const initialTokensPerUser = 100;
      const totalTokensUsed = users.reduce(
        (sum: number, user: { tokens: number }) => {
          const tokensUsed = initialTokensPerUser - user.tokens;
          return sum + (tokensUsed > 0 ? tokensUsed : 0);
        },
        0
      );

      // Return admin statistics
      res.json({
        users: userCount,
        projects: projectCount,
        totalTokensUsed,
        adminEmail: req.user.email,
        timestamp: new Date().toISOString(),
        systemInfo: {
          nodeVersion: process.version,
          environment: process.env["NODE_ENV"] || "development",
          uptime: Math.floor(process.uptime()),
        },
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({
        error: "Failed to fetch admin statistics",
        code: "ADMIN_STATS_ERROR",
      });
    }
  }
);
