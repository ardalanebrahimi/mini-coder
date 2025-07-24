export interface Project {
  id: number;
  userId: number;
  name: string;
  command?: string;
  language: string;
  code: string;
  isPublished: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectListResponse {
  id: number;
  name: string;
  language: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
