import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ProcessedCommand } from "./prompt-processor.service";
import { PublishedProject } from "./app-store.service";

export interface PreviewData {
  id?: number; // Unique ID for the preview
  currentApp: ProcessedCommand | null;
  previewHtml: string;
  previewUrl: string;
  safePreviewUrl: any;
  userCommand: string;
  sourceProject?: PublishedProject; // Add source project for app store previews
}

export interface PreviewAction {
  action: "modify" | "save" | "clear" | "saveToToolbox" | "addToAppStore";
}

@Injectable({
  providedIn: "root",
})
export class PreviewSectionService {
  private previewDataSubject = new BehaviorSubject<PreviewData>({
    currentApp: null,
    previewHtml: "",
    previewUrl: "",
    safePreviewUrl: null,
    userCommand: "",
    sourceProject: undefined,
  });

  private actionSubject = new BehaviorSubject<PreviewAction | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  previewData$ = this.previewDataSubject.asObservable();
  action$ = this.actionSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor() {}

  /**
   * Update the preview data
   */
  updatePreviewData(data: PreviewData): void {
    this.previewDataSubject.next(data);
  }

  /**
   * Get current preview data
   */
  getCurrentPreviewData(): PreviewData {
    return this.previewDataSubject.value;
  }

  /**
   * Set preview data for app store projects
   */
  setAppStorePreview(
    currentApp: ProcessedCommand,
    previewHtml: string,
    previewUrl: string,
    safePreviewUrl: any,
    userCommand: string,
    sourceProject: PublishedProject
  ): void {
    this.previewDataSubject.next({
      currentApp,
      previewHtml,
      previewUrl,
      safePreviewUrl,
      userCommand,
      sourceProject,
    });
  }

  /**
   * Clear preview data
   */
  clearPreviewData(): void {
    const currentData = this.previewDataSubject.value;
    // Revoke old blob URL to prevent memory leaks
    if (currentData.previewUrl) {
      URL.revokeObjectURL(currentData.previewUrl);
    }

    this.previewDataSubject.next({
      currentApp: null,
      previewHtml: "",
      previewUrl: "",
      safePreviewUrl: null,
      userCommand: "",
    });
  }

  /**
   * Emit a preview action
   */
  emitAction(
    action: "modify" | "save" | "clear" | "saveToToolbox" | "addToAppStore"
  ): void {
    this.actionSubject.next({ action });
  }

  /**
   * Reset action state
   */
  resetAction(): void {
    this.actionSubject.next(null);
  }

  /**
   * Check if preview has content
   */
  hasPreviewContent(): boolean {
    return this.previewDataSubject.value.currentApp !== null;
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.isLoadingSubject.next(loading);
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.isLoadingSubject.value;
  }
}
