export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  name?: string;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string; // Google OAuth ID
  profilePicture?: string | null; // Google profile picture URL
}

export interface CreateUserDto {
  username: string;
  email: string;
  name?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  name?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  name?: string;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string; // Google OAuth ID
  profilePicture?: string | null; // Google profile picture URL
}
