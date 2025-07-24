import { Request, Response } from "express";
import { PostService } from "../services/postService";
import { asyncHandler } from "../middleware/errorHandler";

const postService = new PostService();

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await postService.getAllPosts();
  res.json(posts);
});

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const post = await postService.getPostById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
});

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               authorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 */
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const post = await postService.createPost({ title, content, authorId });
  res.status(201).json(post);
});

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const { title, content, published } = req.body;

  const existingPost = await postService.getPostById(id);
  if (!existingPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = await postService.updatePost(id, { title, content, published });
  res.json(post);
});

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);

  const existingPost = await postService.getPostById(id);
  if (!existingPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  await postService.deletePost(id);
  res.json({ message: "Post deleted successfully" });
});
