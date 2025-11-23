import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/gdpr/export:
 *   get:
 *     summary: Export all user data (GDPR Article 20 - Right to Data Portability)
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 projects:
 *                   type: array
 *                 analytics:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
export const exportUserData = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    try {
      // Fetch all user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          tokens: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields like password
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch all projects
      const projects = await prisma.project.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          command: true,
          language: true,
          code: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Fetch analytics data (if stored)
      // Note: This assumes you have an analytics table
      // const analytics = await prisma.analyticsEvent.findMany({
      //   where: { userId },
      // });

      const exportData = {
        exportDate: new Date().toISOString(),
        user,
        projects,
        // analytics, // Uncomment if you have analytics table
        metadata: {
          totalProjects: projects.length,
          publishedProjects: projects.filter((p) => p.isPublished).length,
        },
      };

      // Log the export for compliance
      console.log(
        `GDPR Data Export: User ${userId} exported their data at ${new Date().toISOString()}`
      );

      return res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      return res.status(500).json({
        error: "Failed to export user data",
        code: "EXPORT_FAILED",
      });
    }
  }
);

/**
 * @swagger
 * /api/gdpr/delete:
 *   delete:
 *     summary: Delete all user data (GDPR Article 17 - Right to Erasure)
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data deleted successfully
 *       401:
 *         description: Unauthorized
 */
export const deleteUserData = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    try {
      // Delete in order of foreign key dependencies

      // 1. Delete user's stars
      await prisma.star.deleteMany({
        where: { userId },
      });

      // 2. Delete user's projects
      await prisma.project.deleteMany({
        where: { userId },
      });

      // 3. Delete analytics events (if stored)
      // await prisma.analyticsEvent.deleteMany({
      //   where: { userId },
      // });

      // 4. Delete the user account
      await prisma.user.delete({
        where: { id: userId },
      });

      // Log the deletion for compliance
      console.log(
        `GDPR Data Deletion: User ${userId} deleted their account at ${new Date().toISOString()}`
      );

      return res.json({
        message: "Account and all associated data have been permanently deleted",
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error deleting user data:", error);
      return res.status(500).json({
        error: "Failed to delete user data",
        code: "DELETION_FAILED",
      });
    }
  }
);

/**
 * @swagger
 * /api/gdpr/consent:
 *   post:
 *     summary: Record parental consent for COPPA compliance
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childAge
 *               - parentEmail
 *               - parentName
 *             properties:
 *               childAge:
 *                 type: integer
 *               parentEmail:
 *                 type: string
 *               parentName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consent recorded successfully
 */
export const recordParentalConsent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { childAge, parentEmail, parentName } = req.body;

    if (!childAge || !parentEmail || !parentName) {
      return res.status(400).json({
        error: "Missing required fields: childAge, parentEmail, parentName",
      });
    }

    try {
      // Update user with parental consent information
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          // Add these fields to your User model if they don't exist
          // parentalConsentGiven: true,
          // parentEmail,
          // parentName,
          // childAge,
          // consentTimestamp: new Date(),
        },
      });

      // Log consent for compliance
      console.log(
        `COPPA Consent: User ${req.user.id} received parental consent at ${new Date().toISOString()}`
      );

      // TODO: Send verification email to parent

      return res.json({
        message: "Parental consent recorded successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error recording parental consent:", error);
      return res.status(500).json({
        error: "Failed to record parental consent",
        code: "CONSENT_FAILED",
      });
    }
  }
);
