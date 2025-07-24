export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name?: string;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name?: string;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
}
