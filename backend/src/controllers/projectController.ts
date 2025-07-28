import { Response } from "express";
import { ProjectService } from "../services/projectService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

const projectService = new ProjectService();

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects for the current user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for filtering projects
 *     responses:
 *       200:
 *         description: List of user projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectList'
 *                 total:
 *                   type: integer
 *                   description: Total number of projects
 *       401:
 *         description: Unauthorized
 */
export const getAllProjects = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { search } = req.query;
    let projects;

    if (search && typeof search === "string") {
      projects = await projectService.searchUserProjects(req.user.id, search);
    } else {
      projects = await projectService.getAllUserProjects(req.user.id);
    }

    const total = await projectService.getUserProjectCount(req.user.id);

    return res.json({
      projects,
      total,
    });
  }
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
export const getProjectById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await projectService.getProjectById(id, req.user.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json(project);
  }
);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - language
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *               command:
 *                 type: string
 *                 description: Command to run the project
 *               language:
 *                 type: string
 *                 description: Programming language
 *               code:
 *                 type: string
 *                 description: Project source code
 *               isPublished:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the project is published publicly
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { name, command, language, code, isPublished } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Project name is required" });
    }

    if (
      !language ||
      typeof language !== "string" ||
      language.trim().length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Programming language is required" });
    }

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }

    const project = await projectService.createProject(req.user.id, {
      name: name.trim(),
      command: command?.trim(),
      language: language.trim(),
      code,
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json(project);
  }
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *               command:
 *                 type: string
 *                 description: Command to run the project
 *               language:
 *                 type: string
 *                 description: Programming language
 *               code:
 *                 type: string
 *                 description: Project source code
 *               isPublished:
 *                 type: boolean
 *                 description: Whether the project is published publicly
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const updateProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const { name, command, language, code, isPublished } = req.body;

    // Build update data object with only provided fields
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res
          .status(400)
          .json({ error: "Project name must be a non-empty string" });
      }
      updateData.name = name.trim();
    }

    if (command !== undefined) {
      updateData.command = command?.trim();
    }

    if (language !== undefined) {
      if (typeof language !== "string" || language.trim().length === 0) {
        return res
          .status(400)
          .json({ error: "Programming language must be a non-empty string" });
      }
      updateData.language = language.trim();
    }

    if (code !== undefined) {
      if (typeof code !== "string") {
        return res.status(400).json({ error: "Code must be a string" });
      }
      updateData.code = code;
    }

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
    }

    const project = await projectService.updateProject(
      id,
      req.user.id,
      updateData
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json(project);
  }
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
export const deleteProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const success = await projectService.deleteProject(id, req.user.id);

    if (!success) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json({ message: "Project deleted successfully" });
  }
);

/**
 * @swagger
 * /api/v1/projects/published:
 *   get:
 *     summary: Get all published projects (public endpoint)
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of published projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectList'
 */
export const getPublishedProjects = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const projects = await projectService.getPublishedProjects();
    return res.json({ projects });
  }
);

/**
 * @swagger
 * /api/v1/projects/app-store:
 *   get:
 *     summary: Get published projects for the App Store with pagination and user info
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of projects per page
 *     responses:
 *       200:
 *         description: App Store projects with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublishedProjectResponse'
 *                 total:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
export const getAppStoreProjects = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query["page"] as string) || 1;
    const limit = Math.min(parseInt(req.query["limit"] as string) || 10, 50); // Max 50 per page
    const userId = req.user?.id || null; // Get user ID if authenticated

    const result = await projectService.getPublishedProjectsWithPagination(
      page,
      limit,
      userId
    );

    return res.json({
      ...result,
      page,
      limit,
    });
  }
);

/**
 * @swagger
 * /api/v1/projects/public/{id}:
 *   get:
 *     summary: Get a public project by ID (for trying/previewing)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Public project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublishedProjectResponse'
 *       404:
 *         description: Project not found or not published
 *       403:
 *         description: Project is private
 */
export const getPublicProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await projectService.getPublicProjectById(id);

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or not published" });
    }

    return res.json(project);
  }
);

/**
 * @swagger
 * /api/v1/projects/{id}/publish:
 *   post:
 *     summary: Publish a project to the app store
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Project already published
 */
export const publishProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const result = await projectService.publishProject(id, req.user.id);

    if (!result.success) {
      if (result.error === "Project not found") {
        return res.status(404).json({ error: result.error });
      }
      if (result.error === "Project already published") {
        return res.status(400).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      message: "Project published successfully",
      project: result.project,
    });
  }
);

/**
 * @swagger
 * /api/v1/projects/{id}/unpublish:
 *   post:
 *     summary: Unpublish a project from the app store
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project unpublished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Project not published
 */
export const unpublishProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const result = await projectService.unpublishProject(id, req.user.id);

    if (!result.success) {
      if (result.error === "Project not found") {
        return res.status(404).json({ error: result.error });
      }
      if (result.error === "Project not published") {
        return res.status(400).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      message: "Project unpublished successfully",
      project: result.project,
    });
  }
);
