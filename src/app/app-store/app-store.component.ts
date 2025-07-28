import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import {
  AppStoreService,
  PublishedProject,
  AppStoreResponse,
} from "../services/app-store.service";

@Component({
  selector: "app-app-store",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./app-store.component.html",
  styleUrls: ["./app-store.component.scss"],
})
export class AppStoreComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  projects: PublishedProject[] = [];
  isLoading = false;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 1;
  total = 0;
  error: string | null = null;

  constructor(private appStoreService: AppStoreService) {}

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
   * Preview/run a project
   */
  previewProject(project: PublishedProject): void {
    // TODO: Implement project preview/run functionality
    console.log("Preview project:", project);
  }

  /**
   * Refresh the projects list
   */
  refresh(): void {
    this.loadProjects();
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByProjectId(index: number, project: PublishedProject): number {
    return project.id;
  }
}
