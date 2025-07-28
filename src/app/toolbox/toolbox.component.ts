import { Component, OnDestroy, OnInit, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { SavedProject } from "../services/storage.service";
import { ToolboxProjectItemComponent } from "../toolbox-project-item/toolbox-project-item.component";
import { ToolboxService } from "../services/toolbox.service";
import { TranslationService } from "../services/translation.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-toolbox",
  standalone: true,
  imports: [CommonModule, ToolboxProjectItemComponent, RouterModule],
  templateUrl: "./toolbox.component.html",
  styleUrls: ["./toolbox.component.scss"],
})
export class ToolboxComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() profileRequested = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  // Component state (managed by service)
  isOpen = false;
  savedProjects: SavedProject[] = [];
  selectedProject: SavedProject | null = null;

  constructor(
    private toolboxService: ToolboxService,
    private translationService: TranslationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to toolbox state
    this.toolboxService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isOpen = isOpen;
      });

    this.toolboxService.savedProjects$
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => {
        this.savedProjects = projects;
      });

    this.toolboxService.selectedProject$
      .pipe(takeUntil(this.destroy$))
      .subscribe((project) => {
        this.selectedProject = project;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get translation for current language
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  onCloseClick(): void {
    this.toolboxService.close();
  }

  openProfile(): void {
    this.profileRequested.emit();
  }

  logout(): void {
    this.logoutRequested.emit();
  }
}
