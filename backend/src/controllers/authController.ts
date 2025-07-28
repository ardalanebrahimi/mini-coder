import { Response } from "express";
import { AuthService } from "../services/authService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

const authService = new AuthService();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's unique username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *               name:
 *                 type: string
 *                 description: User's display name
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { username, email, password, name } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error:
          "Username must be 3-20 characters long and contain only letters, numbers, and underscores",
      });
    }

    try {
      const result = await authService.register({
        username,
        email,
        password,
        name,
      });
      return res.status(201).json(result);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "User with this email already exists" ||
          error.message === "User with this username already exists")
      ) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginField
 *               - password
 *             properties:
 *               loginField:
 *                 type: string
 *                 description: User's email or username
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { loginField, password } = req.body;

    if (!loginField || !password) {
      return res
        .status(400)
        .json({ error: "Email/username and password are required" });
    }

    try {
      const result = await authService.login({ loginField, password });
      return res.json(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid email/username or password"
      ) {
        return res.status(401).json({ error: error.message });
      }
      throw error;
    }
  }
);

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await authService.getCurrentUser(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  }
);

/**
 * @swagger
 * /auth/check-availability:
 *   post:
 *     summary: Check username and email availability
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username to check
 *               email:
 *                 type: string
 *                 description: Email to check
 *     responses:
 *       200:
 *         description: Availability check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usernameAvailable:
 *                   type: boolean
 *                 emailAvailable:
 *                   type: boolean
 */
export const checkAvailability = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { username, email } = req.body;

    const result = await authService.checkAvailability({ username, email });
    return res.json(result);
  }
);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 tokens:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await authService.getCurrentUser(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user profile without password hash
    const { passwordHash, ...profileData } = user;
    return res.json(profileData);
  }
);

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update user profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email (optional)
 *               name:
 *                 type: string
 *                 description: New display name (optional)
 *               currentPassword:
 *                 type: string
 *                 description: Current password (required when changing password)
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (optional)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     tokens:
 *                       type: integer
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username or email already exists
 */
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { username, email, name, currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!username && !email && !name && !newPassword) {
      return res
        .status(400)
        .json({ error: "At least one field must be provided for update" });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ error: "Please provide a valid email address" });
      }
    }

    // Validate username format if provided
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          error:
            "Username must be 3-20 characters long and contain only letters, numbers, and underscores",
        });
      }
    }

    // Validate password change
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ error: "Current password is required to change password" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters long" });
      }
    }

    try {
      const result = await authService.updateProfile(req.user.id, {
        username,
        email,
        name,
        currentPassword,
        newPassword,
      });

      return res.json({
        message: "Profile updated successfully",
        user: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message === "Invalid current password") {
          return res.status(400).json({ error: error.message });
        }
      }
      throw error;
    }
  }
);
