import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "../../environments/environment";

export interface PublishedProject {
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

export interface AppStoreResponse {
  projects: PublishedProject[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: "root",
})
export class AppStoreService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/projects`;

  constructor(private http: HttpClient) {}

  /**
   * Get published projects from the App Store with pagination
   */
  getAppStoreProjects(
    page: number = 1,
    limit: number = 10
  ): Observable<AppStoreResponse> {
    return this.http
      .get<AppStoreResponse>(`${this.apiUrl}/app-store`, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          projects: response.projects.map((project) => ({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
            publishedAt: project.publishedAt
              ? new Date(project.publishedAt)
              : undefined,
          })),
        }))
      );
  }

  /**
   * Get a public project by ID for trying/previewing
   */
  getPublicProject(id: number): Observable<PublishedProject> {
    return this.http.get<PublishedProject>(`${this.apiUrl}/public/${id}`).pipe(
      map((project) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        publishedAt: project.publishedAt
          ? new Date(project.publishedAt)
          : undefined,
      }))
    );
  }
}
