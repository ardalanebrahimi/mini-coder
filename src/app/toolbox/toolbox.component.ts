import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { SavedProject } from "../services/storage.service";
import { ToolboxProjectItemComponent } from "../toolbox-project-item/toolbox-project-item.component";
import { ToolboxService } from "../services/toolbox.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-toolbox",
  standalone: true,
  imports: [CommonModule, ToolboxProjectItemComponent],
  templateUrl: "./toolbox.component.html",
  styleUrls: ["./toolbox.component.scss"],
})
export class ToolboxComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state (managed by service)
  isOpen = false;
  savedProjects: SavedProject[] = [];
  selectedProject: SavedProject | null = null;

  constructor(
    private toolboxService: ToolboxService,
    private translationService: TranslationService
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

  onCloseClick(): void {
    this.toolboxService.close();
  }
}
