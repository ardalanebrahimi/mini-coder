import { User } from '@prisma/client';
import { prisma } from '../config/database';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: { email: string; name?: string }): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async updateUser(id: number, data: { email?: string; name?: string }): Promise<User> {
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

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
}
