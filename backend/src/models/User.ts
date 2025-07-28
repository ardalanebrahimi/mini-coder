export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  name?: string;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
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
}
