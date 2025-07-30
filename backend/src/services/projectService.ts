import { prisma } from "../config/database";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponse,
  ProjectListResponse,
  PublishedProjectResponse,
} from "../models/Project";
import { StarService } from "./starService";

export class ProjectService {
  async getAllUserProjects(userId: number): Promise<ProjectListResponse[]> {
    return await prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        language: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getProjectById(
    id: number,
    userId: number
  ): Promise<ProjectResponse | null> {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId, // Ensure user can only access their own projects
      },
    });
    if (!project) return null;
    return {
      ...project,
      command: project.command ?? "",
      publishedAt: (project as any).publishedAt ?? undefined,
    };
  }

  async createProject(
    userId: number,
    data: CreateProjectDto
  ): Promise<ProjectResponse> {
    const project = await prisma.project.create({
      data: {
        ...data,
        userId,
      },
    });
    return {
      ...project,
      command: project.command ?? "",
      publishedAt: (project as any).publishedAt ?? undefined,
    };
  }

  async updateProject(
    id: number,
    userId: number,
    data: UpdateProjectDto
  ): Promise<ProjectResponse | null> {
    // Check if project exists and belongs to user
    const existingProject = await this.getProjectById(id, userId);
    if (!existingProject) {
      return null;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data,
    });
    return {
      ...updatedProject,
      command: updatedProject.command ?? "",
      publishedAt: (updatedProject as any).publishedAt ?? undefined,
    };
  }

  async deleteProject(id: number, userId: number): Promise<boolean> {
    // Check if project exists and belongs to user
    const existingProject = await this.getProjectById(id, userId);
    if (!existingProject) {
      return false;
    }

    await prisma.project.delete({
      where: { id },
    });

    return true;
  }

  async getPublishedProjects(): Promise<ProjectListResponse[]> {
    return await prisma.project.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        name: true,
        language: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getPublishedProjectsWithPagination(
    page: number = 1,
    limit: number = 10,
    userId: number | null = null
  ): Promise<{
    projects: PublishedProjectResponse[];
    total: number;
    hasMore: boolean;
  }> {
    // Use StarService to get projects with star information
    return await StarService.getProjectsWithStars(userId, page, limit);
  }

  async getPublicProjectById(
    id: number
  ): Promise<PublishedProjectResponse | null> {
    const project = await prisma.project.findFirst({
      where: {
        id,
        isPublished: true, // Only return if published
      },
      select: {
        id: true,
        name: true,
        language: true,
        code: true,
        command: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!project) return null;

    return {
      ...project,
      command: project.command ?? "",
    } as PublishedProjectResponse;
  }

  async publishProject(
    id: number,
    userId: number
  ): Promise<{
    success: boolean;
    project?: ProjectResponse;
    error?: string;
  }> {
    try {
      // Check if project exists and belongs to user
      const existingProject = await this.getProjectById(id, userId);
      if (!existingProject) {
        return { success: false, error: "Project not found" };
      }

      // Check if project is already published
      if (existingProject.isPublished) {
        return { success: false, error: "Project already published" };
      }

      // Publish the project
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          isPublished: true,
        },
      });

      return {
        success: true,
        project: {
          ...updatedProject,
          command: updatedProject.command ?? "",
          publishedAt: (updatedProject as any).publishedAt ?? undefined,
        },
      };
    } catch (error) {
      return { success: false, error: "Failed to publish project" };
    }
  }

  async unpublishProject(
    id: number,
    userId: number
  ): Promise<{
    success: boolean;
    project?: ProjectResponse;
    error?: string;
  }> {
    try {
      // Check if project exists and belongs to user
      const existingProject = await this.getProjectById(id, userId);
      if (!existingProject) {
        return { success: false, error: "Project not found" };
      }

      // Check if project is actually published
      if (!existingProject.isPublished) {
        return { success: false, error: "Project not published" };
      }

      // Unpublish the project
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          isPublished: false,
        },
      });

      return {
        success: true,
        project: {
          ...updatedProject,
          command: updatedProject.command ?? "",
          publishedAt: (updatedProject as any).publishedAt ?? undefined,
        },
      };
    } catch (error) {
      return { success: false, error: "Failed to unpublish project" };
    }
  }

  async getUserProjectCount(userId: number): Promise<number> {
    return await prisma.project.count({
      where: { userId },
    });
  }

  async searchUserProjects(
    userId: number,
    query: string
  ): Promise<ProjectListResponse[]> {
    return await prisma.project.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { language: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        language: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }
}
