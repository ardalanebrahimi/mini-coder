import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { AnalyticsService, AnalyticsEventType } from "./analytics.service";

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
  starCount?: number; // Total number of stars
  starred?: boolean; // Whether current user has starred (if user is authenticated)
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

  constructor(private http: HttpClient, private analytics: AnalyticsService) {}

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

  /**
   * Toggle star for a project
   */
  toggleStar(projectId: number): Observable<{
    message: string;
    starred: boolean;
    starCount: number;
    projectId: number;
  }> {
    return this.http
      .post<{
        message: string;
        starred: boolean;
        starCount: number;
        projectId: number;
      }>(`${environment.apiUrl}/api/v1/stars/${projectId}/toggle`, {})
      .pipe(
        tap((response) => {
          // Track star given/removed
          this.analytics.logEvent(AnalyticsEventType.STAR_GIVEN, {
            starGiven: {
              appId: projectId.toString(),
              rating: response.starred ? 1 : 0, // 1 for star given, 0 for star removed
              appLanguage: "unknown", // We don't have language info in this context
            },
          });
        })
      );
  }

  /**
   * Get star status for a project
   */
  getStarStatus(projectId: number): Observable<{
    starred: boolean;
    starCount: number;
    projectId: number;
  }> {
    return this.http.get<{
      starred: boolean;
      starCount: number;
      projectId: number;
    }>(`${environment.apiUrl}/api/v1/stars/${projectId}/status`);
  }
}
