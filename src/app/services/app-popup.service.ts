import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ProcessedCommand } from "./prompt-processor.service";
import { PublishedProject } from "./app-store.service";

export interface AppPopupData {
  isOpen: boolean;
  appId?: number | string;
  currentApp?: ProcessedCommand;
  sourceProject?: PublishedProject;
  title?: string;
  showToolboxActions?: boolean; // Whether to show save/modify actions (for user-created apps)
  isFullscreen?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AppPopupService {
  private popupDataSubject = new BehaviorSubject<AppPopupData>({
    isOpen: false,
    isFullscreen: false,
  });

  popupData$ = this.popupDataSubject.asObservable();

  constructor() {}

  /**
   * Open popup for an app store project
   */
  openAppStoreProject(
    project: PublishedProject,
    currentApp?: ProcessedCommand
  ): void {
    this.popupDataSubject.next({
      isOpen: true,
      appId: project.id,
      currentApp,
      sourceProject: project,
      title: project.name,
      showToolboxActions: false,
      isFullscreen: false,
    });
  }

  /**
   * Open popup for a user-created app (with toolbox actions)
   */
  openUserApp(currentApp: ProcessedCommand, title?: string): void {
    this.popupDataSubject.next({
      isOpen: true,
      currentApp,
      title: title || "Your App",
      showToolboxActions: true,
      isFullscreen: false,
    });
  }

  /**
   * Open popup for a sample app from landing page
   */
  openSampleApp(appId: number, title?: string): void {
    this.popupDataSubject.next({
      isOpen: true,
      appId,
      title: title || "Sample App",
      showToolboxActions: false,
      isFullscreen: false,
    });
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    const current = this.popupDataSubject.value;
    if (current.isOpen) {
      this.popupDataSubject.next({
        ...current,
        isFullscreen: !current.isFullscreen,
      });
    }
  }

  /**
   * Close the popup
   */
  closePopup(): void {
    this.popupDataSubject.next({
      isOpen: false,
      isFullscreen: false,
    });
  }

  /**
   * Get current popup data
   */
  getCurrentPopupData(): AppPopupData {
    return this.popupDataSubject.value;
  }

  /**
   * Check if popup is open
   */
  isPopupOpen(): boolean {
    return this.popupDataSubject.value.isOpen;
  }
}
