import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { SavedProject } from "../services/storage.service";
import { ToolboxService } from "../services/toolbox.service";

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

  constructor(private toolboxService: ToolboxService) {}

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
}
