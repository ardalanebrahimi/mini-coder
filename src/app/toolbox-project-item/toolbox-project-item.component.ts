import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SavedProject } from "../services/storage.service";

@Component({
  selector: "app-toolbox-project-item",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toolbox-project-item.component.html",
  styleUrls: ["./toolbox-project-item.component.scss"],
})
export class ToolboxProjectItemComponent {
  @Input() project!: SavedProject;
  @Input() isSelected: boolean = false;

  @Output() projectClick = new EventEmitter<SavedProject>();
  @Output() deleteClick = new EventEmitter<SavedProject>();

  onProjectClick(): void {
    this.projectClick.emit(this.project);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(this.project);
  }
}
