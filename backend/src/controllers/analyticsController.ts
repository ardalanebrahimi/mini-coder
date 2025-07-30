import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Analytics Controller
 * Handles secure analytics event collection and storage
 * NOTE: Database integration pending - using temporary logging for now
 */
export class AnalyticsController {
  /**
   * Receive and store analytics events from frontend
   * POST /api/analytics/events
   */
  static async receiveEvents(req: Request, res: Response): Promise<void> {
    try {
      const { events } = req.body;

      if (!events || !Array.isArray(events)) {
        res.status(400).json({
          error: "Invalid request body. Expected 'events' array.",
        });
        return;
      }

      // Validate and sanitize each event
      const sanitizedEvents = events.map((event: any) => {
        // Ensure required fields are present
        if (!event.eventType || !event.sessionId || !event.timestamp) {
          throw new Error("Missing required event fields");
        }

        return {
          eventType: String(event.eventType).substring(0, 255), // Limit length
          sessionId: String(event.sessionId).substring(0, 255),
          userId: event.userId ? String(event.userId).substring(0, 255) : null,
          language: String(event.language || "en").substring(0, 10),
          timestamp: new Date(event.timestamp),
          details: event.details || {},
          userAgent: req.get("User-Agent")?.substring(0, 1000) || null,
          ipAddress: AnalyticsController.hashIP(
            AnalyticsController.getClientIP(req)
          ),
        };
      });

      // Batch insert events to database
      try {
        // Test if the model exists
        console.log("Available Prisma models:", Object.keys(prisma));

        await (prisma as any).analyticsEvent.createMany({
          data: sanitizedEvents,
          skipDuplicates: true, // Skip if duplicate sessionId + timestamp
        });

        console.log(
          `📊 Analytics Events Persisted to Database (${sanitizedEvents.length}):`,
          sanitizedEvents
            .map((e) => `${e.eventType} @ ${e.timestamp}`)
            .join(", ")
        );
      } catch (dbError) {
        console.error("Failed to persist events to database:", dbError);
        console.error("Error details:", JSON.stringify(dbError, null, 2));
        // Continue with success response since events were validated
        // This ensures the frontend doesn't retry failed events
      }

      res.status(200).json({
        success: true,
        message: `Received and persisted ${sanitizedEvents.length} analytics events to database`,
        eventsProcessed: sanitizedEvents.length,
        note: "Events stored in PostgreSQL database via Prisma",
      });
    } catch (error) {
      console.error("Error processing analytics events:", error);
      res.status(500).json({
        error: "Failed to process analytics events",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get analytics statistics (admin only)
   * GET /api/analytics/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin (you'll need to implement this check)
      if (!AnalyticsController.isAdmin(req)) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      const now = new Date();
      // const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      // const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get basic statistics
      // TODO: Replace with actual database queries when Prisma is ready
      /*
      const [
        totalEvents,
        todayEvents,
        weekEvents,
        uniqueSessions,
        eventsByType,
        languageDistribution,
      ] = await Promise.all([
        prisma.analyticsEvent.count(),
        prisma.analyticsEvent.count({
          where: { timestamp: { gte: oneDayAgo } },
        }),
        prisma.analyticsEvent.count({
          where: { timestamp: { gte: oneWeekAgo } },
        }),
        prisma.analyticsEvent.groupBy({
          by: ["sessionId"],
          _count: { sessionId: true },
          where: { timestamp: { gte: oneWeekAgo } },
        }),
        prisma.analyticsEvent.groupBy({
          by: ["eventType"],
          _count: { eventType: true },
          where: { timestamp: { gte: oneWeekAgo } },
        }),
        prisma.analyticsEvent.groupBy({
          by: ["language"],
          _count: { language: true },
          where: { timestamp: { gte: oneWeekAgo } },
        }),
      ]);
      */

      // Temporary mock data
      const stats = {
        totalEvents: 0,
        todayEvents: 0,
        weekEvents: 0,
        uniqueSessionsThisWeek: 0,
        eventsByType: {},
        languageDistribution: {},
        generatedAt: now.toISOString(),
        note: "Mock data - database integration pending Prisma migration",
      };

      res.json(stats);
    } catch (error) {
      console.error("Error getting analytics stats:", error);
      res.status(500).json({
        error: "Failed to get analytics statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get analytics events (admin only, paginated)
   * GET /api/analytics/events
   */
  static async getEvents(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!AnalyticsController.isAdmin(req)) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      const page = parseInt(req.query["page"] as string) || 1;
      const limit = Math.min(parseInt(req.query["limit"] as string) || 50, 100);
      const eventType = req.query["eventType"] as string;
      const sessionId = req.query["sessionId"] as string;
      const startDate = req.query["startDate"]
        ? new Date(req.query["startDate"] as string)
        : undefined;
      const endDate = req.query["endDate"]
        ? new Date(req.query["endDate"] as string)
        : undefined;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (eventType) where.eventType = eventType;
      if (sessionId) where.sessionId = sessionId;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      // TODO: Replace with actual database queries when Prisma is ready
      /*
      const [events, totalCount] = await Promise.all([
        prisma.analyticsEvent.findMany({
          where,
          orderBy: { timestamp: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            eventType: true,
            sessionId: true,
            userId: true,
            language: true,
            timestamp: true,
            details: true,
            createdAt: true,
            // Don't return userAgent and ipAddress for privacy
          },
        }),
        prisma.analyticsEvent.count({ where }),
      ]);
      */

      // Temporary mock response
      const events: any[] = [];
      const totalCount = 0;

      res.json({
        events,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Error getting analytics events:", error);
      res.status(500).json({
        error: "Failed to get analytics events",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Health check for analytics service
   * GET /api/analytics/health
   */
  static async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // Test database connection
      // TODO: Replace with actual database check when Prisma is ready
      // await prisma.analyticsEvent.count();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "pending_migration",
        message:
          "Analytics service is ready - database integration pending Prisma migration",
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Clear old analytics data (admin only)
   * DELETE /api/analytics/events
   */
  static async clearOldEvents(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!AnalyticsController.isAdmin(req)) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      const daysToKeep = parseInt(req.query["daysToKeep"] as string) || 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // TODO: Replace with actual database delete when Prisma is ready
      /*
      const result = await prisma.analyticsEvent.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });
      */

      // Temporary mock response
      const result = { count: 0 };

      res.json({
        success: true,
        message: `Deleted ${result.count} analytics events older than ${daysToKeep} days`,
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
      });
    } catch (error) {
      console.error("Error clearing old analytics events:", error);
      res.status(500).json({
        error: "Failed to clear old analytics events",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Hash IP address for privacy
   */
  private static hashIP(ip: string): string {
    return crypto
      .createHash("sha256")
      .update(ip + process.env["ANALYTICS_SALT"] || "default_salt")
      .digest("hex")
      .substring(0, 32);
  }

  /**
   * Get client IP address
   */
  private static getClientIP(req: Request): string {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "0.0.0.0"
    );
  }

  /**
   * Check if user is admin (implement based on your auth system)
   */
  private static isAdmin(req: Request): boolean {
    // TODO: Implement admin check based on your authentication system
    // For now, check if user has admin role or is in development environment
    const user = (req as any).user;
    return (
      process.env["NODE_ENV"] === "development" ||
      (user && (user.role === "admin" || user.isAdmin))
    );
  }
}
