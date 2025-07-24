import { Post } from "@prisma/client";
import { prisma } from "../config/database";

export class PostService {
  async getAllPosts(): Promise<Post[]> {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getPostById(id: number): Promise<Post | null> {
    return await prisma.post.findUnique({
      where: { id },
    });
  }

  async createPost(data: {
    title: string;
    content?: string;
    authorId?: number;
  }): Promise<Post> {
    return await prisma.post.create({
      data,
    });
  }

  async updatePost(
    id: number,
    data: { title?: string; content?: string; published?: boolean }
  ): Promise<Post> {
    return await prisma.post.update({
      where: { id },
      data,
    });
  }

  async deletePost(id: number): Promise<Post> {
    return await prisma.post.delete({
      where: { id },
    });
  }

  async getPublishedPosts(): Promise<Post[]> {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
