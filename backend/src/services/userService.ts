import { User } from "@prisma/client";
import { prisma } from "../config/database";

export class UserService {
  async getAllUsers(): Promise<any[]> {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        tokens: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserById(id: number): Promise<any | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        tokens: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // async createUser(data: {
  //   email: string;
  //   passwordHash: string;
  //   name?: string;
  //   username?: string;
  // }): Promise<User> {
  //   return await prisma.user.create({
  //     data,
  //   });
  // }

  async updateUser(
    id: number,
    data: { email?: string; name?: string }
  ): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<any | null> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        tokens: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
