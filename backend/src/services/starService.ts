import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class StarService {
  /**
   * Toggle star for a project
   * @param userId - The user ID
   * @param projectId - The project ID
   * @returns Object with star status and total count
   */
  static async toggleStar(userId: number, projectId: number) {
    try {
      // Check if project exists and is published
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          isPublished: true,
        },
      });

      if (!project) {
        throw new Error("Project not found or not published");
      }

      // Check if star already exists using raw SQL
      const existingStarResult = await prisma.$queryRaw`
        SELECT id FROM stars WHERE "userId" = ${userId} AND "projectId" = ${projectId}
      `;
      const existingStar =
        Array.isArray(existingStarResult) && existingStarResult.length > 0
          ? existingStarResult[0]
          : null;

      let starred = false;

      if (existingStar) {
        // Remove star using raw SQL
        await prisma.$executeRaw`
          DELETE FROM stars WHERE "userId" = ${userId} AND "projectId" = ${projectId}
        `;
        starred = false;
      } else {
        // Add star using raw SQL
        await prisma.$executeRaw`
          INSERT INTO stars ("userId", "projectId", "createdAt") 
          VALUES (${userId}, ${projectId}, NOW())
        `;
        starred = true;
      }

      // Get total star count using raw SQL
      const starCountResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM stars WHERE "projectId" = ${projectId}
      `;
      const starCount =
        Array.isArray(starCountResult) && starCountResult.length > 0
          ? Number((starCountResult[0] as any).count)
          : 0;

      return {
        starred,
        starCount,
        projectId,
      };
    } catch (error) {
      console.error("Error toggling star:", error);
      throw error;
    }
  }

  /**
   * Get star status for a project by a user
   * @param userId - The user ID
   * @param projectId - The project ID
   * @returns Star status and count
   */
  static async getStarStatus(userId: number | null, projectId: number) {
    try {
      // Get total star count using raw SQL
      const starCountResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM stars WHERE "projectId" = ${projectId}
      `;
      const starCount =
        Array.isArray(starCountResult) && starCountResult.length > 0
          ? Number((starCountResult[0] as any).count)
          : 0;

      let starred = false;
      if (userId) {
        // Check if user has starred this project using raw SQL
        const userStarResult = await prisma.$queryRaw`
          SELECT id FROM stars WHERE "userId" = ${userId} AND "projectId" = ${projectId}
        `;
        starred = Array.isArray(userStarResult) && userStarResult.length > 0;
      }

      return {
        starred,
        starCount,
        projectId,
      };
    } catch (error) {
      console.error("Error getting star status:", error);
      throw error;
    }
  }

  /**
   * Get projects with star counts (for app store listing)
   * @param userId - Optional user ID to include starred status
   * @param page - Page number
   * @param limit - Items per page
   * @returns Projects with star information
   */
  static async getProjectsWithStars(
    userId: number | null = null,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;

      // Get projects with star counts using raw SQL
      const projectsQuery = userId
        ? `
          SELECT 
            p.*,
            u.id as user_id,
            u.username as user_username,
            u.name as user_name,
            COALESCE(star_counts.star_count, 0) as star_count,
            CASE WHEN user_stars.id IS NOT NULL THEN true ELSE false END as starred
          FROM projects p
          JOIN users u ON p."userId" = u.id
          LEFT JOIN (
            SELECT "projectId", COUNT(*) as star_count
            FROM stars
            GROUP BY "projectId"
          ) star_counts ON p.id = star_counts."projectId"
          LEFT JOIN stars user_stars ON p.id = user_stars."projectId" AND user_stars."userId" = ${userId}
          WHERE p."isPublished" = true
          ORDER BY p."updatedAt" DESC
          LIMIT ${limit} OFFSET ${skip}
        `
        : `
          SELECT 
            p.*,
            u.id as user_id,
            u.username as user_username,
            u.name as user_name,
            COALESCE(star_counts.star_count, 0) as star_count,
            false as starred
          FROM projects p
          JOIN users u ON p."userId" = u.id
          LEFT JOIN (
            SELECT "projectId", COUNT(*) as star_count
            FROM stars
            GROUP BY "projectId"
          ) star_counts ON p.id = star_counts."projectId"
          WHERE p."isPublished" = true
          ORDER BY p."updatedAt" DESC
          LIMIT ${limit} OFFSET ${skip}
        `;

      const projects = await prisma.$queryRawUnsafe(projectsQuery);

      // Get total count
      const totalResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM projects WHERE "isPublished" = true
      `;
      const total =
        Array.isArray(totalResult) && totalResult.length > 0
          ? Number((totalResult[0] as any).count)
          : 0;

      const hasMore =
        skip + (Array.isArray(projects) ? projects.length : 0) < total;

      // Transform projects to include star information
      const projectsWithStars = Array.isArray(projects)
        ? projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            command: project.command || undefined,
            language: project.language,
            isPublished: project.isPublished,
            publishedAt: project.publishedAt,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            user: {
              id: project.user_id,
              username: project.user_username,
              name: project.user_name,
            },
            starCount: Number(project.star_count) || 0,
            starred: Boolean(project.starred),
          }))
        : [];

      return {
        projects: projectsWithStars,
        total,
        hasMore,
        page,
        limit,
      };
    } catch (error) {
      console.error("Error getting projects with stars:", error);
      throw error;
    }
  }
}
