import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
  SaveDialogService,
  SaveDialogData,
} from "../services/save-dialog.service";
import { StorageService, SavedProject } from "../services/storage.service";
import { ToolboxService } from "../services/toolbox.service";
import { TranslationService } from "../services/translation.service";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "../services/analytics.service";
import { AuthService } from "../services/auth.service";

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
  publishSuccessMessage = "";
  isPublishing = false;
  currentSaveMode: "toolbox" | "appstore" = "appstore"; // Track current save mode

  constructor(
    private saveDialogService: SaveDialogService,
    private storageService: StorageService,
    private toolboxService: ToolboxService,
    private translationService: TranslationService,
    private analytics: AnalyticsService,
    private authService: AuthService
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
        this.currentSaveMode = data?.saveMode || "appstore"; // Set current save mode

        // Pre-populate project name based on app status
        if (data?.currentApp) {
          // If app has ID, try to get existing name first
          if (data.currentApp.id) {
            const existingProject = this.findExistingProject();
            this.projectName = existingProject
              ? existingProject.name
              : data.currentApp.projectName || "";
          } else {
            // For new apps, use generated project name
            this.projectName = data.currentApp.projectName || "";
          }
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
   * Handle Enter key press in input field - save based on current mode
   */
  onEnterKey(): void {
    if (this.currentSaveMode === "toolbox") {
      this.saveToToolbox();
    } else {
      this.addToAppStore();
    }
  }

  /**
   * Cancel save operation and close dialog
   */
  cancelSave(): void {
    this.saveDialogService.closeDialog();
  }

  /**
   * Check if a project already exists (by ID first, then by name and content)
   */
  private findExistingProject(): SavedProject | null {
    if (!this.dialogData?.currentApp) return null;

    const currentProjects = this.toolboxService.getSavedProjects();

    // First check if the current app has an ID and matches an existing project
    if (this.dialogData.currentApp.id) {
      const projectById = currentProjects.find(
        (project) => project.id === this.dialogData!.currentApp!.id
      );
      if (projectById) return projectById;
    }

    // Fallback: check by name and content for unsaved apps
    return (
      currentProjects.find(
        (project) =>
          project.name === this.projectName.trim() &&
          project.code === this.dialogData!.currentApp!.generatedCode
      ) || null
    );
  }

  /**
   * Update an existing project's publication status
   */
  private updateExistingProject(
    existingProject: SavedProject,
    isPublished: boolean
  ): void {
    this.isPublishing = true;
    this.errorMessage = "";
    this.publishSuccessMessage = "";

    // Update the existing project
    this.storageService
      .updateProject(existingProject.id, {
        isPublished: isPublished,
        command: this.dialogData!.userCommand,
        language: this.dialogData!.currentApp!.detectedLanguage,
        code: this.dialogData!.currentApp!.generatedCode,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProject) => {
          if (updatedProject) {
            // Update the project in toolbox service
            this.toolboxService.removeProject(existingProject.id);
            this.toolboxService.addProject(updatedProject);

            const action = isPublished
              ? "published to App Store"
              : "updated in toolbox";
            this.publishSuccessMessage = isPublished
              ? `🎉 "${updatedProject.name}" is now live in the App Store!`
              : `💾 "${updatedProject.name}" updated in your toolbox!`;

            this.isPublishing = false;

            // Show success message
            this.showSuccessMessage(`"${updatedProject.name}" ${action}!`);

            // Close dialog after showing success message briefly
            setTimeout(() => {
              this.saveDialogService.closeDialog();
            }, 2000);
          } else {
            this.errorMessage = "Failed to update project. Please try again.";
            this.isPublishing = false;
          }
        },
        error: (error) => {
          this.errorMessage = "Failed to update project. Please try again.";
          console.error("Error updating project:", error);
          this.isPublishing = false;
        },
      });
  }

  /**
   * Save to toolbox (private)
   */
  saveToToolbox(): void {
    if (!this.projectName.trim()) {
      this.errorMessage =
        this.t("projectNameRequired") || "Please enter a project name!";
      return;
    }

    if (!this.dialogData?.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    const isLoggedIn = this.authService.isLoggedIn();

    // Check if this is an update to an existing project
    const existingProject = this.findExistingProject();
    if (existingProject) {
      // If the app already exists, update it instead of creating a duplicate
      this.updateExistingProject(existingProject, false); // false = not published
      return;
    }

    // For new apps or apps without IDs, check if user wants to create a new project
    // with the same name (this handles cases where content changed significantly)
    const projectWithSameName = this.toolboxService
      .getSavedProjects()
      .find((project) => project.name === this.projectName.trim());

    if (projectWithSameName && !this.dialogData.currentApp.id) {
      // Ask user if they want to overwrite or create a new version
      const overwrite = confirm(
        `A project named "${this.projectName.trim()}" already exists. Do you want to overwrite it?`
      );

      if (overwrite) {
        this.updateExistingProject(projectWithSameName, false);
        return;
      } else {
        // User chose not to overwrite, let generateUniqueProjectName handle it
      }
    }

    // Log toolbox save attempt
    this.analytics.logEvent(AnalyticsEventType.TOOLBOX_SAVED, {
      toolboxSaved: {
        appName: this.projectName.trim(),
        language: this.dialogData.currentApp.detectedLanguage,
        userType: isLoggedIn ? "logged_in" : "guest",
        saveMethod: isLoggedIn ? "backend" : "local_storage",
      },
    });

    this.isPublishing = true;
    this.errorMessage = "";
    this.publishSuccessMessage = "";

    // Generate unique name and save to toolbox
    this.storageService
      .generateUniqueProjectName(this.projectName.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uniqueName) => {
          // Save project to toolbox (private, not published)
          this.storageService
            .saveProject({
              name: uniqueName,
              command: this.dialogData!.userCommand,
              language: this.dialogData!.currentApp!.detectedLanguage,
              code: this.dialogData!.currentApp!.generatedCode,
              isPublished: false, // Toolbox saves are always private
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (savedProject) => {
                // Update the current app with the new ID so it's no longer "unsaved"
                if (this.dialogData?.currentApp) {
                  this.dialogData.currentApp.id = savedProject.id;
                  // Also emit an event to notify the app component
                  this.emitAppSavedEvent(savedProject);
                }

                this.toolboxService.addProject(savedProject);

                this.publishSuccessMessage = `💾 "${uniqueName}" saved to your toolbox!`;
                this.isPublishing = false;

                // Show success message
                this.showSuccessMessage(
                  `Saved "${uniqueName}" to your toolbox!`
                );

                // Close dialog after showing success message briefly
                setTimeout(() => {
                  this.saveDialogService.closeDialog();
                }, 2000);
              },
              error: (error) => {
                this.errorMessage =
                  "Failed to save to toolbox. Please try again.";
                console.error("Error saving to toolbox:", error);
                this.isPublishing = false;
              },
            });
        },
        error: (error) => {
          this.errorMessage =
            "Failed to generate unique name. Please try again.";
          console.error("Error generating unique name:", error);
          this.isPublishing = false;
        },
      });
  }

  /**
   * Add to App Store (public, requires login)
   */
  addToAppStore(): void {
    if (!this.projectName.trim()) {
      this.errorMessage =
        this.t("projectNameRequired") || "Please enter a project name!";
      return;
    }

    if (!this.dialogData?.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    const isLoggedIn = this.authService.isLoggedIn();

    // Check if this app is already published or exists
    const existingProject = this.findExistingProject();
    if (existingProject) {
      if (existingProject.isPublished) {
        this.errorMessage = `"${existingProject.name}" is already published to the App Store.`;
        return;
      } else {
        // Update existing project to be published
        this.updateExistingProject(existingProject, true); // true = published
        return;
      }
    }

    // Log app store publish attempt
    this.analytics.logEvent(AnalyticsEventType.APPSTORE_PUBLISH_ATTEMPTED, {
      appstorePublishAttempted: {
        appName: this.projectName.trim(),
        language: this.dialogData.currentApp.detectedLanguage,
        userType: isLoggedIn ? "logged_in" : "guest",
        loginPromptShown: !isLoggedIn,
      },
    });

    // Check if user is logged in
    if (!isLoggedIn) {
      this.errorMessage =
        "Please log in or register to publish to the App Store.";
      // Close this dialog and show auth modal
      this.saveDialogService.closeDialog();
      this.showAuthModal();
      return;
    }

    this.isPublishing = true;
    this.errorMessage = "";
    this.publishSuccessMessage = "";

    // Generate unique name and publish
    this.storageService
      .generateUniqueProjectName(this.projectName.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uniqueName) => {
          // Save and publish project to App Store
          this.storageService
            .saveProject({
              name: uniqueName,
              command: this.dialogData!.userCommand,
              language: this.dialogData!.currentApp!.detectedLanguage,
              code: this.dialogData!.currentApp!.generatedCode,
              isPublished: true, // App Store saves are always public
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (savedProject) => {
                // Update the current app with the new ID and published status
                if (this.dialogData?.currentApp) {
                  this.dialogData.currentApp.id = savedProject.id;
                  // Also emit an event to notify the app component
                  this.emitAppSavedEvent(savedProject);
                }

                this.toolboxService.addProject(savedProject);

                // Track successful publication
                this.analytics.logEvent(AnalyticsEventType.APP_PUBLISHED, {
                  appPublished: {
                    appName: uniqueName,
                    language: this.dialogData!.currentApp!.detectedLanguage,
                    success: true,
                  },
                });

                this.publishSuccessMessage = `🎉 "${uniqueName}" is now live in the App Store! Other kids can discover and try your creation.`;
                this.isPublishing = false;

                // Close dialog after showing success message briefly
                setTimeout(() => {
                  this.saveDialogService.closeDialog();
                }, 2000);
              },
              error: (error) => {
                this.errorMessage =
                  "Failed to publish to App Store. Please try again.";
                console.error("Error publishing to App Store:", error);

                // Track failed publication
                this.analytics.logEvent(AnalyticsEventType.APP_PUBLISHED, {
                  appPublished: {
                    appName: this.projectName.trim(),
                    language: this.dialogData!.currentApp!.detectedLanguage,
                    success: false,
                  },
                });

                this.isPublishing = false;
              },
            });
        },
        error: (error) => {
          this.errorMessage =
            "Failed to generate unique name. Please try again.";
          console.error("Error generating unique name:", error);
          this.isPublishing = false;
        },
      });
  }

  /**
   * Check if the current app is already saved in the toolbox
   */
  public isAppSaved(): boolean {
    return !!this.dialogData?.currentApp?.id;
  }

  /**
   * Check if the current app is already published
   */
  public isAppPublished(): boolean {
    if (!this.dialogData?.currentApp?.id) return false;

    const existingProject = this.findExistingProject();
    return existingProject ? existingProject.isPublished : false;
  }

  /**
   * Get the current app's name if it exists
   */
  public getCurrentAppName(): string {
    if (!this.dialogData?.currentApp?.id) return "";

    const existingProject = this.findExistingProject();
    return existingProject ? existingProject.name : "";
  }

  /**
   * Reset form state
   */
  private resetForm(): void {
    this.projectName = "";
    this.errorMessage = "";
    this.publishSuccessMessage = "";
    this.isPublishing = false;
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    const event = new CustomEvent("saveSuccess", {
      detail: { message },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Show auth modal for login/register
   */
  private showAuthModal(): void {
    // Emit an event that the app component can listen to
    const event = new CustomEvent("showAuthModal", {
      detail: {
        message: "Please log in or register to publish to the App Store.",
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Emit event when app is saved to update the main app component
   */
  private emitAppSavedEvent(savedProject: SavedProject): void {
    const event = new CustomEvent("appSaved", {
      detail: { savedProject },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }
}
