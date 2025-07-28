import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import { prisma } from "../config/database";
import { generateToken } from "../middleware/auth";

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface LoginUserDto {
  loginField: string; // Can be either email or username
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    name?: string;
    tokens: number;
  };
  token: string;
}

export class AuthService {
  private readonly saltRounds = 12;

  async register(data: RegisterUserDto): Promise<AuthResponse> {
    const { username, email, password, name } = data;
    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      throw new Error("User with this username already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create user with 100 tokens
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        name: name ?? null,
        tokens: 100,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name ?? "",
        tokens: user.tokens,
      },
      token,
    };
  }

  async login(data: LoginUserDto): Promise<AuthResponse> {
    const { loginField, password } = data;

    // For now, treat loginField as email until database migration is complete
    const user = await prisma.user.findUnique({
      where: { email: loginField },
    });

    if (!user) {
      throw new Error("Invalid email/username or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email/username or password");
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name ?? "",
        tokens: user.tokens,
      },
      token,
    };
  }

  async getCurrentUser(userId: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    });
  }

  async updateTokens(userId: number, tokens: number): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { tokens },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    });
  }

  async checkAvailability(data: {
    username?: string;
    email?: string;
  }): Promise<{ usernameAvailable?: boolean; emailAvailable?: boolean }> {
    const result: { usernameAvailable?: boolean; emailAvailable?: boolean } =
      {};

    if (data.username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      result.usernameAvailable = !existingUserByUsername;
    }

    if (data.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      result.emailAvailable = !existingUserByEmail;
    }

    return result;
  }
}
