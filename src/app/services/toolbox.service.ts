import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SavedProject } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class ToolboxService {
  // State management
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private selectedProjectSubject = new BehaviorSubject<SavedProject | null>(
    null
  );
  private savedProjectsSubject = new BehaviorSubject<SavedProject[]>([]);

  // Public observables
  public isOpen$ = this.isOpenSubject.asObservable();
  public selectedProject$ = this.selectedProjectSubject.asObservable();
  public savedProjects$ = this.savedProjectsSubject.asObservable();

  // Event streams
  private projectLoadSubject = new BehaviorSubject<SavedProject | null>(null);
  private projectDeleteSubject = new BehaviorSubject<SavedProject | null>(null);

  public projectLoad$ = this.projectLoadSubject.asObservable();
  public projectDelete$ = this.projectDeleteSubject.asObservable();

  constructor() {}

  // Toolbox state management
  open(): void {
    this.isOpenSubject.next(true);
  }

  close(): void {
    this.isOpenSubject.next(false);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  // Project management
  setSavedProjects(projects: SavedProject[]): void {
    this.savedProjectsSubject.next(projects);
  }

  getSavedProjects(): SavedProject[] {
    return this.savedProjectsSubject.value;
  }

  addProject(project: SavedProject): void {
    const currentProjects = this.savedProjectsSubject.value;
    this.savedProjectsSubject.next([...currentProjects, project]);
  }

  removeProject(projectId: number): void {
    const currentProjects = this.savedProjectsSubject.value;
    const updatedProjects = currentProjects.filter((p) => p.id !== projectId);
    this.savedProjectsSubject.next(updatedProjects);

    // Clear selection if deleted project was selected
    if (this.selectedProjectSubject.value?.id === projectId) {
      this.setSelectedProject(null);
    }
  }

  setSelectedProject(project: SavedProject | null): void {
    this.selectedProjectSubject.next(project);
  }

  getSelectedProject(): SavedProject | null {
    return this.selectedProjectSubject.value;
  }

  // Actions
  loadProject(project: SavedProject): void {
    this.setSelectedProject(project);
    this.projectLoadSubject.next(project);
  }

  deleteProject(project: SavedProject): void {
    this.projectDeleteSubject.next(project);
  }

  // Utility methods
  refreshProjects(storageService: any): void {
    // The storageService now returns observables, so this method should be updated
    // to handle async operations in the components that use it
    console.warn(
      "refreshProjects should be updated to handle async operations"
    );
  }
}
