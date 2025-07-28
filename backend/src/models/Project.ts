export interface Project {
  id: number;
  userId: number;
  name: string;
  command?: string;
  language: string;
  code: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  command?: string;
  language: string;
  code: string;
  isPublished?: boolean;
}

export interface UpdateProjectDto {
  name?: string;
  command?: string;
  language?: string;
  code?: string;
  isPublished?: boolean;
}

export interface ProjectResponse {
  id: number;
  userId: number;
  name: string;
  command?: string;
  language: string;
  code: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectListResponse {
  id: number;
  name: string;
  language: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublishedProjectResponse {
  id: number;
  name: string;
  command?: string;
  language: string;
  code?: string; // Optional, only included when getting individual project details
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    name?: string;
  };
}
