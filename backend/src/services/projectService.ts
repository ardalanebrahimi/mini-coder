import { prisma } from "../config/database";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponse,
  ProjectListResponse,
} from "../models/Project";

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
    return await prisma.project.findFirst({
      where: {
        id,
        userId, // Ensure user can only access their own projects
      },
    });
  }

  async createProject(
    userId: number,
    data: CreateProjectDto
  ): Promise<ProjectResponse> {
    return await prisma.project.create({
      data: {
        ...data,
        userId,
      },
    });
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

    return await prisma.project.update({
      where: { id },
      data,
    });
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
