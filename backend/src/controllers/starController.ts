import { Request, Response } from "express";
import { StarService } from "../services/starService";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export class StarController {
  /**
   * Toggle star for a project
   */
  static async toggleStar(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const projectIdParam = req.params["projectId"];
      const projectId = projectIdParam ? parseInt(projectIdParam) : NaN;

      if (!userId) {
        res.status(401).json({
          error: "Authentication required to star projects",
        });
        return;
      }

      if (!projectId || isNaN(projectId)) {
        res.status(400).json({
          error: "Valid project ID is required",
        });
        return;
      }

      const result = await StarService.toggleStar(userId, projectId);

      res.json({
        message: result.starred ? "Project starred" : "Star removed",
        ...result,
      });
    } catch (error: any) {
      console.error("Error toggling star:", error);
      res.status(500).json({
        error: error.message || "Failed to toggle star",
      });
    }
  }

  /**
   * Get star status for a project
   */
  static async getStarStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id || null;
      const projectIdParam = req.params["projectId"];
      const projectId = projectIdParam ? parseInt(projectIdParam) : NaN;

      if (!projectId || isNaN(projectId)) {
        res.status(400).json({
          error: "Valid project ID is required",
        });
        return;
      }

      const result = await StarService.getStarStatus(userId, projectId);

      res.json(result);
    } catch (error: any) {
      console.error("Error getting star status:", error);
      res.status(500).json({
        error: error.message || "Failed to get star status",
      });
    }
  }
}
