import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { asyncHandler } from "../middleware/errorHandler";

const userService = new UserService();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    return res.json(users);
  }
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const user = await userService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});

// /**
//  * @swagger
//  * /api/v1/users:
//  *   post:
//  *     summary: Create a new user
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *             properties:
//  *               email:
//  *                 type: string
//  *               name:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: User created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/User'
//  *       400:
//  *         description: Invalid input
//  */
// export const createUser = asyncHandler(async (req: Request, res: Response) => {
//   const { email, name } = req.body;

//   if (!email) {
//     return res.status(400).json({ error: "Email is required" });
//   }

//   const existingUser = await userService.getUserByEmail(email);
//   if (existingUser) {
//     return res
//       .status(400)
//       .json({ error: "User with this email already exists" });
//   }

//   // For demonstration, set a default password hash (replace with real hash logic in production)
//   const passwordHash = "";
//   const user = await userService.createUser({ email, passwordHash, name });
//   return res.status(201).json(user);
// });

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const { email, name } = req.body;

  const existingUser = await userService.getUserById(id);
  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = await userService.updateUser(id, { email, name });
  return res.json(user);
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);

  const existingUser = await userService.getUserById(id);
  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  await userService.deleteUser(id);
  return res.json({ message: "User deleted successfully" });
});
