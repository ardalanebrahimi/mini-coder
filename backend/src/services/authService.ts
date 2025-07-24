import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { prisma } from "../config/database";
import { generateToken } from "../middleware/auth";

export interface RegisterUserDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name?: string;
    tokens: number;
  };
  token: string;
}

export class AuthService {
  private readonly saltRounds = 12;

  async register(data: RegisterUserDto): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create user with 100 tokens
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        tokens: 100,
      },
      select: {
        id: true,
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
        email: user.email,
        name: user.name ?? "",
        tokens: user.tokens,
      },
      token,
    };
  }

  async login(data: LoginUserDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
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
        email: true,
        name: true,
        tokens: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    });
  }
}
