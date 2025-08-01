import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import {
  AppStoreService,
  PublishedProject,
  AppStoreResponse,
} from "../services/app-store.service";
import { AuthService } from "../services/auth.service";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "../services/analytics.service";
import { AppPopupService } from "../services/app-popup.service";

@Component({
  selector: "app-app-store",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./app-store.component.html",
  styleUrls: ["./app-store.component.scss"],
})
export class AppStoreComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() starRequiresAuth = new EventEmitter<string>();

  projects: PublishedProject[] = [];
  isLoading = false;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 1;
  total = 0;
  error: string | null = null;

  constructor(
    private appStoreService: AppStoreService,
    private authService: AuthService,
    private analytics: AnalyticsService,
    private appPopupService: AppPopupService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load the first page of projects
   */
  loadProjects(): void {
    this.isLoading = true;
    this.error = null;
    this.currentPage = 1;

    this.appStoreService
      .getAppStoreProjects(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AppStoreResponse) => {
          this.projects = response.projects;
          this.hasMore = response.hasMore;
          this.total = response.total;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.error = "Failed to load projects. Please try again.";
          this.isLoading = false;
          console.error("Error loading app store projects:", error);
        },
      });
  }

  /**
   * Load more projects (pagination)
   */
  loadMore(): void {
    if (!this.hasMore || this.isLoadingMore) return;

    this.isLoadingMore = true;
    this.currentPage++;

    this.appStoreService
      .getAppStoreProjects(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AppStoreResponse) => {
          this.projects = [...this.projects, ...response.projects];
          this.hasMore = response.hasMore;
          this.isLoadingMore = false;
        },
        error: (error: any) => {
          this.error = "Failed to load more projects.";
          this.isLoadingMore = false;
          this.currentPage--; // Revert page increment
          console.error("Error loading more projects:", error);
        },
      });
  }

  /**
   * Try/preview a project
   */
  onTryProject(project: PublishedProject): void {
    // Log guest user trying an app from App Store
    if (!this.authService.isLoggedIn()) {
      this.analytics.logGuestAppViewed(
        project.id.toString(),
        project.name,
        project.language || "en"
      );
    }

    // Get the full project details including code
    this.appStoreService
      .getPublicProject(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fullProject: PublishedProject) => {
          // Log guest user starting an app
          if (!this.authService.isLoggedIn()) {
            this.analytics.logGuestAppStarted(
              fullProject.id.toString(),
              fullProject.name,
              fullProject.language || "en"
            );
          }

          // Open the app in popup instead of emitting to parent
          this.appPopupService.openAppStoreProject(fullProject);
        },
        error: (error: any) => {
          console.error("Error loading project for preview:", error);
          // Log error
          this.analytics.logEvent(AnalyticsEventType.API_ERROR, {
            apiError: {
              endpoint: `/public-projects/${project.id}`,
              statusCode: error.status || 0,
              errorMessage: error.message || "Failed to load project",
            },
          });
        },
      });
  }

  /**
   * Refresh the projects list
   */
  refresh(): void {
    this.loadProjects();
  }

  /**
   * Handle star button click
   */
  onStarProject(project: PublishedProject): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      // Log attempt to save app to toolbox as guest
      this.analytics.logLoginPromptShown("star_project");
      this.starRequiresAuth.emit("Please log in to star projects!");
      return;
    }

    // Toggle star
    this.appStoreService
      .toggleStar(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Update the project in the local array
          const projectIndex = this.projects.findIndex(
            (p) => p.id === project.id
          );
          if (projectIndex !== -1) {
            this.projects[projectIndex] = {
              ...this.projects[projectIndex],
              starred: response.starred,
              starCount: response.starCount,
            };
          }
        },
        error: (error: any) => {
          console.error("Error toggling star:", error);
          if (error.status === 401) {
            this.starRequiresAuth.emit("Please log in to star projects!");
          }
          // Log API error
          this.analytics.logEvent(AnalyticsEventType.API_ERROR, {
            apiError: {
              endpoint: `/stars/${project.id}`,
              statusCode: error.status || 0,
              errorMessage: error.message || "Failed to toggle star",
            },
          });
        },
      });
  }

  /**
   * Check if current user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByProjectId(index: number, project: PublishedProject): number {
    return project.id;
  }
}
