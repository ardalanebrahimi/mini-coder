import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedProject } from '../services/storage.service';
import { ToolboxProjectItemComponent } from '../toolbox-project-item/toolbox-project-item.component';

@Component({
  selector: 'app-toolbox',
  standalone: true,
  imports: [CommonModule, ToolboxProjectItemComponent],
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent {
  @Input() isOpen: boolean = false;
  @Input() savedProjects: SavedProject[] = [];
  @Input() selectedProject: SavedProject | null = null;
  @Input() translations: any = {};
  @Input() selectedLanguage: string = 'en';

  @Output() closeToolbox = new EventEmitter<void>();
  @Output() loadProject = new EventEmitter<SavedProject>();
  @Output() deleteProject = new EventEmitter<SavedProject>();

  /**
   * Get translation for current language
   */
  t(key: string): string {
    const translations = this.translations[this.selectedLanguage as keyof typeof this.translations];
    return (translations as any)?.[key] || key;
  }

  onCloseClick(): void {
    this.closeToolbox.emit();
  }

  onProjectLoad(project: SavedProject): void {
    this.loadProject.emit(project);
  }

  onProjectDelete(project: SavedProject): void {
    this.deleteProject.emit(project);
  }
}
