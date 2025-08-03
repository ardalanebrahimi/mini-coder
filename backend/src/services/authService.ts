import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { generateToken } from "../middleware/auth";

export interface RegisterUserDto {
  username: string;
  email?: string;
  password?: string;
  name?: string;
  googleId?: string; // Google OAuth ID
  profilePicture?: string; // Google profile picture URL
}

export interface LoginUserDto {
  loginField: string; // Can be either email or username
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email?: string;
    name?: string;
    tokens: number;
  };
  token: string;
}

export class AuthService {
  private readonly saltRounds = 12;

  async register(data: RegisterUserDto): Promise<AuthResponse> {
    const { username, email, password, name, googleId, profilePicture } = data;
    console.log("Registering user:", username, email);

    // Check if email is provided and if user already exists by email
    if (email) {
      const existingUserByEmail = await this.findUserByEmail(email);

      if (existingUserByEmail) {
        throw new Error("User with this email already exists");
      }
    }

    // Check if user already exists by username
    const existingUserByUsername = await this.findUserByUsername(username);

    if (existingUserByUsername) {
      throw new Error("User with this username already exists");
    }

    let passwordHash;
    if (password) {
      // Hash password
      passwordHash = await bcrypt.hash(password, this.saltRounds);
    }

    // Prepare user data for creation
    const userData: any = {
      username,
      passwordHash,
      name: name ?? username, // Use username as name if not provided
      tokens: 100,
    };

    // Only include email if it's provided
    if (email) {
      userData.email = email;
    }

    // Include Google OAuth data if provided
    if (googleId) {
      userData.googleId = googleId;
    }
    if (profilePicture) {
      userData.profilePicture = profilePicture;
    }

    // Create user with 100 tokens
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
      },
    });

    // Generate JWT token
    const token = this.generateUserToken(user);

    const userResponse: AuthResponse["user"] = {
      id: user.id,
      username: user.username,
      name: user.name ?? "",
      tokens: user.tokens,
    };

    if (user.email) {
      userResponse.email = user.email;
    }

    return {
      user: userResponse,
      token,
    };
  }

  public generateUserToken(user: {
    name: string | null;
    id: number;
    username: string;
    email: string | null;
    tokens: number;
  }) {
    return generateToken(user.id, user.email || "");
  }

  public async findUserByEmail(email: string | undefined) {
    if (!email) {
      return null;
    }
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async login(data: LoginUserDto): Promise<AuthResponse> {
    const { loginField, password } = data;

    // Determine if loginField is email or username
    const isEmail = loginField.includes("@");

    // Find user by email or username
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: loginField } : { username: loginField },
    });

    if (!user) {
      throw new Error("Invalid email/username or password");
    }

    if (!user.passwordHash) {
      throw new Error("Invalid email/username or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email/username or password");
    }

    // Generate JWT token
    const token = this.generateUserToken(user);

    const userResponse: AuthResponse["user"] = {
      id: user.id,
      username: user.username,
      name: user.name ?? "",
      tokens: user.tokens,
    };

    if (user.email) {
      userResponse.email = user.email;
    }

    return {
      user: userResponse,
      token,
    };
  }

  async getCurrentUser(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateTokens(userId: number, tokens: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { tokens },
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
      const existingUserByEmail = await this.findUserByEmail(data.email);
      result.emailAvailable = !existingUserByEmail;
    }

    return result;
  }

  async updateProfile(
    userId: number,
    data: {
      username?: string;
      email?: string;
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ): Promise<{
    id: number;
    username: string;
    email?: string;
    name: string | null;
    tokens: number;
  }> {
    const { username, email, name, currentPassword, newPassword } = data;

    // Get current user for validation
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Validate current password if changing password
    if (newPassword) {
      if (!currentPassword) {
        throw new Error("Current password is required to change password");
      }

      if (!currentUser.passwordHash) {
        throw new Error("User has no password set");
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.passwordHash
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Invalid current password");
      }
    }

    // Check for uniqueness if username or email is being changed
    if (username && username !== currentUser.username) {
      const existingUserByUsername = await this.findUserByUsername(username);

      if (existingUserByUsername) {
        throw new Error("User with this username already exists");
      }
    }

    if (email && email !== currentUser.email) {
      const existingUserByEmail = await this.findUserByEmail(email);
      if (existingUserByEmail) {
        throw new Error("User with this email already exists");
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;

    // Hash new password if provided
    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, this.saltRounds);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        tokens: true,
      },
    });

    // Return user with proper typing
    const result: {
      id: number;
      username: string;
      email?: string;
      name: string | null;
      tokens: number;
    } = {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      tokens: updatedUser.tokens,
    };

    if (updatedUser.email) {
      result.email = updatedUser.email;
    }

    return result;
  }

  /**
   * Generates a unique username based on a base string.
   * If the base username is taken, appends a number until a unique username is found.
   */
  async generateUniqueUsername(base: string): Promise<string> {
    let username = base.replace(/\s+/g, "_").toLowerCase();
    let suffix = 0;
    while (await this.findUserByUsername(username + (suffix ? suffix : ""))) {
      suffix++;
    }
    return username + (suffix ? suffix : "");
  }

  private async findUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Update user with specific fields
   */
  async updateUser(
    userId: number,
    data: { googleId?: string; profilePicture?: string }
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
