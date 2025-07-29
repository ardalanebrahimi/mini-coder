import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { SavedProject } from "../services/storage.service";
import { ToolboxService } from "../services/toolbox.service";
import { StorageService } from "../services/storage.service";

@Component({
  selector: "app-toolbox-project-item",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toolbox-project-item.component.html",
  styleUrls: ["./toolbox-project-item.component.scss"],
})
export class ToolboxProjectItemComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() project!: SavedProject;

  isSelected = false;
  isPublishing = false;
  isUnpublishing = false;

  constructor(
    private toolboxService: ToolboxService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Subscribe to selected project changes to update selection state
    this.toolboxService.selectedProject$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedProject) => {
        this.isSelected = selectedProject?.id === this.project.id;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProjectClick(): void {
    this.toolboxService.loadProject(this.project);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.toolboxService.deleteProject(this.project);
  }

  onPublishClick(event: Event): void {
    event.stopPropagation();

    if (this.isPublishing) return;

    this.isPublishing = true;
    this.storageService
      .publishProject(this.project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.project = response.project;
          this.isPublishing = false;
        },
        error: (error) => {
          this.isPublishing = false;
          console.error("Failed to publish project:", error);
          // Optionally show error message to user
        },
      });
  }

  onUnpublishClick(event: Event): void {
    event.stopPropagation();

    if (this.isUnpublishing) return;

    this.isUnpublishing = true;
    this.storageService
      .unpublishProject(this.project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.project = response.project;
          this.isUnpublishing = false;
        },
        error: (error) => {
          this.isUnpublishing = false;
          console.error("Failed to unpublish project:", error);
          // Optionally show error message to user
        },
      });
  }
}
