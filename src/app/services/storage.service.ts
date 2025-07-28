import { Observable, map, of } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface SavedProject {
  id: number;
  name: string;
  command?: string;
  language: string;
  code: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/projects`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get HTTP headers with authentication token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  }

  /**
   * Save a project via API
   * @param project - Project to save
   */
  saveProject(
    project: Omit<
      SavedProject,
      "id" | "createdAt" | "updatedAt" | "publishedAt"
    >
  ): Observable<SavedProject> {
    const projectData = {
      ...project,
      // Default to false if isPublished is not provided
      isPublished: project.isPublished ?? false,
    };

    return this.http
      .post<SavedProject>(this.apiUrl, projectData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => ({
          ...response,
          createdAt: new Date(response.createdAt),
          updatedAt: new Date(response.updatedAt),
        }))
      );
  }

  /**
   * Get all saved projects from API
   * @returns Observable of array of saved projects
   */
  getAllProjects(): Observable<SavedProject[]> {
    return this.http
      .get<{ projects: SavedProject[]; total: number }>(this.apiUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) =>
          response.projects.map((project) => ({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          }))
        )
      );
  }

  /**
   * Get a project by ID from API
   * @param id - Project ID
   * @returns Observable of project or null if not found
   */
  getProject(id: number): Observable<SavedProject | null> {
    return this.http
      .get<SavedProject>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => ({
          ...response,
          createdAt: new Date(response.createdAt),
          updatedAt: new Date(response.updatedAt),
        }))
      );
  }

  /**
   * Update an existing project via API
   * @param id - Project ID
   * @param updates - Partial project updates
   * @returns Observable of updated project or null if not found
   */
  updateProject(
    id: number,
    updates: Partial<Omit<SavedProject, "id" | "createdAt" | "updatedAt">>
  ): Observable<SavedProject | null> {
    return this.http
      .put<SavedProject>(`${this.apiUrl}/${id}`, updates, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => ({
          ...response,
          createdAt: new Date(response.createdAt),
          updatedAt: new Date(response.updatedAt),
        }))
      );
  }

  /**
   * Delete a project via API
   * @param id - Project ID
   * @returns Observable of boolean indicating success
   */
  deleteProject(id: number): Observable<boolean> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map(() => true));
  }

  /**
   * Search projects via API
   * @param query - Search query
   * @returns Observable of array of matching projects
   */
  searchProjects(query: string): Observable<SavedProject[]> {
    return this.http
      .get<{ projects: SavedProject[]; total: number }>(
        `${this.apiUrl}?search=${encodeURIComponent(query)}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        map((response) =>
          response.projects.map((project) => ({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          }))
        )
      );
  }

  // /**
  //  * Get projects count via API
  //  * @returns Observable of number of saved projects
  //  */
  // getProjectsCount(): Observable<number> {
  //   return this.http
  //     .get<{ projects: SavedProject[]; total: number }>(this.apiUrl, {
  //       headers: this.getAuthHeaders(),
  //     })
  //     .pipe(map((response) => response.total));
  // }

  /**
   * Check if project name already exists via API
   * @param name - Project name to check
   * @returns Observable of boolean indicating if name exists
   */
  isProjectNameExists(name: string): Observable<boolean> {
    return this.searchProjects(name).pipe(
      map((projects) =>
        projects.some(
          (project) => project.name.toLowerCase() === name.toLowerCase()
        )
      )
    );
  }

  /**
   * Generate unique project name via API check
   * @param baseName - Base name for the project
   * @returns Observable of unique project name
   */
  generateUniqueProjectName(baseName: string): Observable<string> {
    return this.getAllProjects().pipe(
      map((projects) => {
        let name = baseName;
        let counter = 1;

        while (
          projects.some(
            (project) => project.name.toLowerCase() === name.toLowerCase()
          )
        ) {
          name = `${baseName}-${counter}`;
          counter++;
        }

        return name;
      })
    );
  }

  /**
   * Publish a project to the app store
   */
  publishProject(
    id: number
  ): Observable<{ message: string; project: SavedProject }> {
    return this.http
      .post<{ message: string; project: SavedProject }>(
        `${this.apiUrl}/${id}/publish`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((response) => ({
          message: response.message,
          project: {
            ...response.project,
            createdAt: new Date(response.project.createdAt),
            updatedAt: new Date(response.project.updatedAt),
            publishedAt: response.project.publishedAt
              ? new Date(response.project.publishedAt)
              : undefined,
          },
        }))
      );
  }

  /**
   * Unpublish a project from the app store
   */
  unpublishProject(
    id: number
  ): Observable<{ message: string; project: SavedProject }> {
    return this.http
      .post<{ message: string; project: SavedProject }>(
        `${this.apiUrl}/${id}/unpublish`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((response) => ({
          message: response.message,
          project: {
            ...response.project,
            createdAt: new Date(response.project.createdAt),
            updatedAt: new Date(response.project.updatedAt),
            publishedAt: response.project.publishedAt
              ? new Date(response.project.publishedAt)
              : undefined,
          },
        }))
      );
  }

  // Legacy methods for backward compatibility (deprecated)

  /**
   * @deprecated Use getAllProjects() instead
   * Clear all projects - Not supported in API mode
   */
  clearAllProjects(): void {
    console.warn(
      "clearAllProjects() is not supported when using API backend. Projects are managed per user account."
    );
  }
}
