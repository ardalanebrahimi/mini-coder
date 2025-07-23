import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
  SaveDialogService,
  SaveDialogData,
} from "../services/save-dialog.service";
import { StorageService } from "../services/storage.service";
import { ToolboxService } from "../services/toolbox.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-save-dialog",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./save-dialog.component.html",
  styleUrls: ["./save-dialog.component.scss"],
})
export class SaveDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  showDialog = false;
  dialogData: SaveDialogData | null = null;
  projectName = "";
  errorMessage = "";

  constructor(
    private saveDialogService: SaveDialogService,
    private storageService: StorageService,
    private toolboxService: ToolboxService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Subscribe to dialog visibility
    this.saveDialogService.showDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((show) => {
        this.showDialog = show;
        if (!show) {
          this.resetForm();
        }
      });

    // Subscribe to dialog data
    this.saveDialogService.dialogData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.dialogData = data;
        // Pre-populate project name if available
        if (data?.currentApp?.projectName) {
          this.projectName = data.currentApp.projectName;
        }
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
   * Handle dialog overlay click (close dialog)
   */
  onOverlayClick(): void {
    this.cancelSave();
  }

  /**
   * Handle dialog content click (prevent event bubbling)
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Handle Enter key press in input field
   */
  onEnterKey(): void {
    this.confirmSave();
  }

  /**
   * Cancel save operation and close dialog
   */
  cancelSave(): void {
    this.saveDialogService.closeDialog();
  }

  /**
   * Confirm save with custom name
   */
  confirmSave(): void {
    if (!this.projectName.trim()) {
      this.errorMessage =
        this.t("projectNameRequired") || "Please enter a project name!";
      return;
    }

    if (!this.dialogData?.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    try {
      // Generate unique name if needed
      const uniqueName = this.storageService.generateUniqueProjectName(
        this.projectName
      );

      const savedProject = this.storageService.saveProject({
        name: uniqueName,
        command: this.dialogData.userCommand,
        language: this.dialogData.currentApp.detectedLanguage,
        code: this.dialogData.currentApp.generatedCode,
      });

      // Update the toolbox service with the new project
      this.toolboxService.addProject(savedProject);

      // Close dialog and reset form
      this.saveDialogService.closeDialog();

      // Show success message through toolbox service or emit an event
      this.showSuccessMessage(`Saved "${uniqueName}" to your toolbox!`);
    } catch (error) {
      this.errorMessage = "Failed to save project. Please try again.";
      console.error("Error saving project:", error);
    }
  }

  /**
   * Reset form data
   */
  private resetForm(): void {
    this.projectName = "";
    this.errorMessage = "";
  }

  /**
   * Show success message (you might want to use a toast service or emit an event)
   */
  private showSuccessMessage(message: string): void {
    // For now, we'll emit a custom event that the parent can listen to
    // In a real app, you might use a toast service or notification service
    const event = new CustomEvent("saveSuccess", {
      detail: { message },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }
}
