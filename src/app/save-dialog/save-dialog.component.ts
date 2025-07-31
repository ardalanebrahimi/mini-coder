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
   * Handle Enter key press in input field - publish to App Store
   */
  onEnterKey(): void {
    this.addToAppStore();
  }

  /**
   * Cancel save operation and close dialog
   */
  cancelSave(): void {
    this.saveDialogService.closeDialog();
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
}
