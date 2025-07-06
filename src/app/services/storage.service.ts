import { Injectable } from "@angular/core";

export interface SavedProject {
  id: string;
  name: string;
  command: string;
  language: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private readonly STORAGE_KEY = "mini-coder-projects";

  constructor() {}

  /**
   * Save a project to local storage
   * @param project - Project to save
   */
  saveProject(
    project: Omit<SavedProject, "id" | "createdAt" | "updatedAt">
  ): SavedProject {
    const projects = this.getAllProjects();
    const now = new Date();

    const savedProject: SavedProject = {
      ...project,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    projects.push(savedProject);
    this.saveToStorage(projects);

    return savedProject;
  }

  /**
   * Get all saved projects
   * @returns Array of saved projects
   */
  getAllProjects(): SavedProject[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const projects = JSON.parse(stored);
      // Convert date strings back to Date objects
      return projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      }));
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  }

  /**
   * Get a project by ID
   * @param id - Project ID
   * @returns Project or null if not found
   */
  getProject(id: string): SavedProject | null {
    const projects = this.getAllProjects();
    return projects.find((project) => project.id === id) || null;
  }

  /**
   * Update an existing project
   * @param id - Project ID
   * @param updates - Partial project updates
   * @returns Updated project or null if not found
   */
  updateProject(
    id: string,
    updates: Partial<SavedProject>
  ): SavedProject | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveToStorage(projects);
    return projects[index];
  }

  /**
   * Delete a project
   * @param id - Project ID
   * @returns true if deleted, false if not found
   */
  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) return false;

    projects.splice(index, 1);
    this.saveToStorage(projects);
    return true;
  }

  /**
   * Clear all projects
   */
  clearAllProjects(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get projects count
   * @returns Number of saved projects
   */
  getProjectsCount(): number {
    return this.getAllProjects().length;
  }

  /**
   * Check if project name already exists
   * @param name - Project name to check
   * @returns true if name exists
   */
  isProjectNameExists(name: string): boolean {
    const projects = this.getAllProjects();
    return projects.some(
      (project) => project.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Generate unique project name
   * @param baseName - Base name for the project
   * @returns Unique project name
   */
  generateUniqueProjectName(baseName: string): string {
    let name = baseName;
    let counter = 1;

    while (this.isProjectNameExists(name)) {
      name = `${baseName}-${counter}`;
      counter++;
    }

    return name;
  }

  /**
   * Save projects array to localStorage
   * @param projects - Projects array
   */
  private saveToStorage(projects: SavedProject[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving projects:", error);
      throw new Error("Failed to save projects. Storage might be full.");
    }
  }

  /**
   * Generate unique ID
   * @returns Unique ID string
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
