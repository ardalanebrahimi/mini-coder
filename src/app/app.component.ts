import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject, takeUntil } from "rxjs";
import {
  PromptProcessorService,
  ProcessedCommand,
} from "./services/prompt-processor.service";
import { StorageService, SavedProject } from "./services/storage.service";
import { AuthService } from "./services/auth.service";
import { ToolboxComponent } from "./toolbox/toolbox.component";
import { InputSectionComponent } from "./input-section/input-section.component";
import { SaveDialogComponent } from "./save-dialog/save-dialog.component";
import { BuildChoiceDialogComponent } from "./build-choice-dialog/build-choice-dialog.component";
import { ModifyAppDialogComponent } from "./modify-app-dialog/modify-app-dialog.component";
import { PreviewSectionComponent } from "./preview-section/preview-section.component";
import { AuthModalComponent } from "./shared/auth-modal.component";
import { ProfileModalComponent } from "./profile/profile-modal.component";
import { AppStoreComponent } from "./app-store/app-store.component";
import { VoiceInputModalComponent } from "./voice-input-modal/voice-input-modal.component";
import { AnalyticsDashboardComponent } from "./shared/analytics-dashboard.component";
import { AppPopupComponent } from "./app-popup/app-popup.component";
import { AppSharingModalComponent } from "./app-sharing-modal/app-sharing-modal.component";
import { FooterComponent } from "./landing/footer/footer.component";
import { ToolboxService } from "./services/toolbox.service";
import { PublishedProject } from "./services/app-store.service";
import { TranslationService } from "./services/translation.service";
import { TestPreviewService } from "./services/test-preview.service";
import { CommandInputService } from "./services/command-input.service";
import { SaveDialogService } from "./services/save-dialog.service";
import { ProfileService } from "./services/profile.service";
import {
  BuildChoiceDialogService,
  BuildChoiceType,
} from "./services/build-choice-dialog.service";
import {
  ModifyAppDialogService,
  ModifyMode,
} from "./services/modify-app-dialog.service";
import {
  CommandActionsService,
  CommandAction,
} from "./services/command-actions.service";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "./services/analytics.service";
import { PreviewSectionService } from "./services/preview-section.service";
import { VoiceActionService } from "./services/voice-action.service";
import { AppPopupService } from "./services/app-popup.service";
import { EXAMPLE_COMMANDS } from "./examples";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToolboxComponent,
    InputSectionComponent,
    SaveDialogComponent,
    BuildChoiceDialogComponent,
    ModifyAppDialogComponent,
    PreviewSectionComponent,
    AuthModalComponent,
    ProfileModalComponent,
    AppStoreComponent,
    VoiceInputModalComponent,
    AnalyticsDashboardComponent,
    AppPopupComponent,
    AppSharingModalComponent,
    FooterComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  title = "Mini Coder";

  // Input and processing state
  userCommand = "";
  isProcessing = false;
  errorMessage = "";

  // Generated app state
  currentApp: ProcessedCommand | null = null;
  previewHtml = "";
  previewId = 0;
  previewUrl = ""; // For blob URL
  safePreviewUrl: any = null; // For sanitized blob URL

  // Source project when trying from App Store
  sourceProject: PublishedProject | null = null;

  // UI state - removed save dialog related properties

  // Modify app feature
  isModifying = false;

  // Voice input feature (legacy - removed, now using WhisperVoiceService)
  // These properties are kept for backward compatibility with existing subscriptions
  isListening = false;
  voiceSupported = false;

  // Voice modal state
  showVoiceModal = false;

  // Auth modal state
  showAuthModal = false;
  authModalMessage = "";

  // Profile modal state
  showProfileModal = false;

  // Event listener functions for cleanup
  private saveSuccessListener?: (event: any) => void;
  private showAuthModalListener?: (event: any) => void;
  private appSavedListener?: (event: any) => void;

  // Navigation state
  currentView: "app" | "store" = "app";

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Show auth modal with custom message
   */
  showAuthModalWithMessage(message: string): void {
    this.authModalMessage = message;
    this.showAuthModal = true;
    // Log that login prompt was shown
    this.analytics.logLoginPromptShown(message);
  }

  /**
   * Close auth modal
   */
  closeAuthModal(): void {
    this.showAuthModal = false;
    this.authModalMessage = "";
  }

  /**
   * Show profile modal
   */
  showProfile(): void {
    if (!this.isAuthenticated()) {
      this.showAuthModalWithMessage("Please log in to view your profile.");
      return;
    }
    this.showProfileModal = true;
    // Log profile access
    this.analytics.logProfileAccessed();
  }

  /**
   * Close profile modal
   */
  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  /**
   * Handle logout request from toolbox
   */
  handleLogout(): void {
    this.authService.logout();
    // Clear any current app data
    this.currentApp = null;
    this.sourceProject = null;
    this.previewHtml = "";
    this.previewId = 0;
    this.previewUrl = "";
    this.safePreviewUrl = null;
    this.userCommand = "";
    this.errorMessage = "";
  }

  // Navigation methods
  switchToApp(): void {
    const previousView = this.currentView;
    this.currentView = "app";
    // Log navigation to main app view
    this.analytics.logNavigationChange(previousView, "app");
  }

  switchToStore(): void {
    const previousView = this.currentView;
    this.currentView = "store";
    // Log tab change to App Store
    this.analytics.logNavigationChange(previousView, "store");
  }

  // Try project from App Store
  onTryProject(project: PublishedProject): void {
    if (!project.code) {
      this.errorMessage = "❌ Unable to load project code.";
      return;
    }

    // Store the source project for star functionality
    this.sourceProject = project;

    // Create a ProcessedCommand-like object for the preview
    this.currentApp = {
      userCommand: `Try: ${project.name}`,
      detectedLanguage: project.language,
      generatedCode: project.code,
      projectName: project.name,
      id: project.id,
      isReadOnly: true, // Mark as read-only
      sanitizedCode: this.sanitizer.bypassSecurityTrustHtml(project.code),
    } as ProcessedCommand;

    // Set preview HTML
    this.previewHtml = project.code;

    // Create blob URL for iframe
    this.previewUrl = this.createBlobUrl(project.code);

    // Sanitize the blob URL for Angular
    this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.previewUrl
    );

    // Update the preview service
    this.updatePreviewService();

    // Switch to app view to show the preview
    this.currentView = "app";

    // Clear any existing error messages
    this.errorMessage = "";

    // Show success message
    this.errorMessage = `✅ Trying "${project.name}" by ${
      project.user.name || project.user.username
    }`;

    // Clear the success message after 3 seconds
    setTimeout(() => {
      if (this.errorMessage.startsWith("✅")) {
        this.errorMessage = "";
      }
    }, 3000);
  }

  // Rebuild vs modify choice
  // UI state - removed build choice dialog related properties

  constructor(
    private promptProcessor: PromptProcessorService,
    private storageService: StorageService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private toolboxService: ToolboxService,
    private translationService: TranslationService,
    private testPreviewService: TestPreviewService,
    private commandInputService: CommandInputService,
    private commandActionsService: CommandActionsService,
    private saveDialogService: SaveDialogService,
    private buildChoiceDialogService: BuildChoiceDialogService,
    public modifyAppDialogService: ModifyAppDialogService,
    private previewSectionService: PreviewSectionService,
    private profileService: ProfileService,
    private voiceActionService: VoiceActionService,
    private analytics: AnalyticsService,
    private appPopupService: AppPopupService
  ) {}

  /**
   * Get translation for current language
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  /**
   * Get available languages
   */
  get availableLanguages() {
    return this.translationService.getAvailableLanguages();
  }

  /**
   * Get current selected language
   */
  get selectedLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  /**
   * Change UI language
   */
  changeLanguage(languageCode: string): void {
    this.translationService.setLanguage(languageCode);
    // Note: Voice language is now handled by WhisperVoiceService automatically
  }

  /**
   * Update preview service with current data
   */
  private updatePreviewService(): void {
    if (this.sourceProject) {
      // Using app store preview with source project information
      this.previewSectionService.setAppStorePreview(
        this.currentApp!,
        this.previewHtml,
        this.previewUrl,
        this.safePreviewUrl,
        this.userCommand,
        this.sourceProject
      );
    } else {
      // Regular preview without source project
      this.previewSectionService.updatePreviewData({
        currentApp: this.currentApp,
        previewHtml: this.previewHtml,
        previewUrl: this.previewUrl,
        safePreviewUrl: this.safePreviewUrl,
        userCommand: this.userCommand,
        id: this.previewId,
      });
    }
  }

  /**
   * Show modify app dialog
   */
  showModifyAppDialog(): void {
    // Log modify app attempt
    this.analytics.logEvent(AnalyticsEventType.APP_MODIFIED, {
      appModified: {
        modification: "modify_attempt",
        language: this.selectedLanguage,
        success: this.authService.isLoggedIn(),
        errorMessage: this.authService.isLoggedIn()
          ? undefined
          : "Authentication required",
      },
    });

    // Check authentication before allowing modify
    if (!this.authService.isLoggedIn()) {
      this.showAuthModalWithMessage(
        `Please log in or register to modify your app.`
      );
      return;
    }

    this.modifyAppDialogService.openModifyDialog(
      this.currentApp,
      this.userCommand
    );
  }

  /**
   * Process modify/rebuild command with given parameters
   * Uses the new processModifyCommand for better context handling
   */
  processModifyCommandWithParams(command: string, isRebuilding: boolean): void {
    if (!command.trim()) {
      this.errorMessage = this.t("modifyPlaceholder");
      return;
    }

    if (!this.currentApp && !isRebuilding) {
      this.errorMessage = "No app to modify!";
      return;
    }

    this.isModifying = true;
    this.errorMessage = "";

    // Set processing state in the modify dialog
    this.modifyAppDialogService.setProcessing(true);
    this.isProcessing = true;

    // Set loading state in preview section
    this.previewSectionService.setLoading(true);
    // For rebuild mode, use the standard processCommand method
    if (isRebuilding) {
      this.promptProcessor.processCommand(command).subscribe({
        next: (result: ProcessedCommand) => {
          this.handleModifySuccess(result, command, true);
        },
        error: (error) => {
          this.handleModifyError(error, true);
        },
      });
    } else {
      // For modify mode, use the new processModifyCommand method with current app code
      const currentAppCode = this.currentApp?.generatedCode || "";

      this.promptProcessor
        .processModifyCommand(command, currentAppCode)
        .subscribe({
          next: (result: ProcessedCommand) => {
            this.handleModifySuccess(result, command, false);
          },
          error: (error) => {
            this.handleModifyError(error, false);
          },
        });
    }
  }

  /**
   * Handle successful modify/rebuild operation
   * @param result - The processed command result
   * @param command - The original command
   * @param isRebuilding - Whether this was a rebuild operation
   */
  private handleModifySuccess(
    result: ProcessedCommand,
    command: string,
    isRebuilding: boolean
  ): void {
    this.isProcessing = false;
    // Preserve the original app ID when modifying (not rebuilding)
    if (!isRebuilding && this.currentApp?.id) {
      result.id = this.currentApp.id;
    }

    // Update current app with modified/rebuilt version
    this.currentApp = result;
    this.previewHtml = result.generatedCode;

    // If rebuilding, update the original command too
    if (isRebuilding) {
      this.userCommand = command;
    }

    // Create new blob URL for modified app
    this.previewUrl = this.createBlobUrl(result.generatedCode);
    this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.previewUrl
    );

    this.isModifying = false;

    // Close the modify dialog after processing
    this.modifyAppDialogService.closeAfterProcessing();

    // Clear loading state in preview section
    this.previewSectionService.setLoading(false);

    // Update preview service
    this.updatePreviewService();

    // Switch to app view to show the preview
    this.currentView = "app";

    // Automatically open the modified/rebuilt app in full-screen popup modal
    this.appPopupService.openUserApp(
      result,
      result.projectName ||
        (isRebuilding ? "Your Rebuilt App" : "Your Modified App")
    );

    // Show success message
    const successMessage = isRebuilding
      ? `${this.t("rebuildApp")} successful!`
      : `${this.t("modifyApp")} successful!`;
    this.showSuccessMessage(successMessage);

    // Track successful modification/rebuild
    if (isRebuilding) {
      this.analytics.logEvent(AnalyticsEventType.APP_REBUILT, {
        appRebuilt: {
          originalPrompt: this.userCommand || "unknown",
          newPrompt: command,
          language: this.selectedLanguage,
          success: true,
        },
      });
    } else {
      this.analytics.logAppModified(command, this.selectedLanguage, true);
    }
  }

  /**
   * Handle modify/rebuild operation error
   * @param error - The error that occurred
   * @param isRebuilding - Whether this was a rebuild operation
   */
  private handleModifyError(error: any, isRebuilding: boolean): void {
    this.isProcessing = false;
    console.error("Error modifying/rebuilding app:", error);
    this.errorMessage = isRebuilding
      ? `${this.t("rebuildApp")} failed. Please try again.`
      : `${this.t("modifyApp")} failed. Please try again.`;
    this.isModifying = false;

    // Close the modify dialog after processing (even on error)
    this.modifyAppDialogService.closeAfterProcessing();

    // Clear loading state in preview section
    this.previewSectionService.setLoading(false);

    // Track failed modification/rebuild
    if (isRebuilding) {
      this.analytics.logEvent(AnalyticsEventType.APP_REBUILT, {
        appRebuilt: {
          originalPrompt: this.userCommand || "unknown",
          newPrompt: "failed_rebuild",
          language: this.selectedLanguage,
          success: false,
        },
      });
    } else {
      this.analytics.logAppModified(
        "failed_modification",
        this.selectedLanguage,
        false,
        this.errorMessage
      );
    }

    // Track general app error
    this.analytics.logAppError(
      this.errorMessage,
      isRebuilding ? "app_rebuild" : "app_modification",
      error.stack
    );
  }

  /**
   * Initialize voice recognition (now handled by WhisperVoiceService)
   */
  initializeVoiceRecognition(): void {
    // Legacy method kept for compatibility
    // Voice recognition is now handled by WhisperVoiceService
    this.voiceSupported = this.voiceActionService.isVoiceSupported();
    this.commandInputService.setVoiceSupported(this.voiceSupported);
  }

  /**
   * Start voice input (now handled by VoiceActionService)
   */
  startVoiceInput(): void {
    // Check authentication before allowing voice input
    if (!this.authService.isLoggedIn()) {
      this.showAuthModalWithMessage(
        `Please log in or register to use voice input.`
      );
      return;
    }
    // Legacy method - now handled by the new voice modal system
    // This is called by the command actions service when START_VOICE action is triggered
    console.log("startVoiceInput called - opening voice modal for main input");
    this.voiceActionService.openVoiceModalForMainInput();
  }

  /**
   * Show build choice dialog (modify vs rebuild)
   */
  showBuildChoiceModal(): void {
    // Check authentication before allowing modify/rebuild
    if (!this.authService.isLoggedIn()) {
      this.showAuthModalWithMessage(
        `Please log in or register to modify your app.`
      );
      return;
    }

    this.buildChoiceDialogService.openDialog();
    this.errorMessage = "";
  }

  /**
   * Show rebuild dialog
   */
  showRebuildDialog(): void {
    this.modifyAppDialogService.openRebuildDialog(
      this.currentApp,
      this.userCommand
    );
  }

  /**
   * Check if user is authenticated for protected features
   */
  private checkAuthForFeature(featureName: string): boolean {
    if (!this.authService.isLoggedIn()) {
      this.authModalMessage = `${this.t(
        "notLoggedInMessage"
      )} (${featureName})`;
      this.showAuthModal = true;
      return false;
    }
    return true;
  }

  /**
   * Handle successful authentication
   */
  onAuthSuccess(user: any): void {
    // Reload saved projects after successful auth
    this.loadSavedProjects();
    this.closeAuthModal();
    this.showSuccessMessage(`Welcome, ${user.name || user.email}!`);
  }

  ngOnInit(): void {
    this.loadSavedProjects();
    this.initializeVoiceRecognition();
    this.setupServiceSubscriptions();
    this.setupVoiceModalSubscriptions();

    // Listen for save success events from the save dialog component
    this.saveSuccessListener = (event: any) => {
      this.showSuccessMessage(event.detail.message);
    };
    document.addEventListener("saveSuccess", this.saveSuccessListener);

    // Listen for auth modal requests from save dialog
    this.showAuthModalListener = (event: any) => {
      this.showAuthModalWithMessage(event.detail.message);
    };
    document.addEventListener("showAuthModal", this.showAuthModalListener);

    // Listen for app saved events from save dialog
    this.appSavedListener = (event: any) => {
      const savedProject = event.detail.savedProject;
      // Update the current app with the saved project ID if it matches
      if (this.currentApp && savedProject && !this.currentApp.id) {
        this.currentApp.id = savedProject.id;
        // Update preview service as well
        this.updatePreviewService();
      }
    };
    document.addEventListener("appSaved", this.appSavedListener);

    // Listen for build choice results
    this.buildChoiceDialogService.choice$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          if (result.choice === BuildChoiceType.MODIFY_EXISTING) {
            this.showModifyAppDialog();
          } else if (result.choice === BuildChoiceType.REBUILD_FROM_SCRATCH) {
            this.showRebuildDialog();
          }
        }
      });

    // Listen for modify app dialog results
    this.modifyAppDialogService.result$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.processModifyCommandWithParams(
            result.command,
            result.mode === ModifyMode.REBUILD
          );
        }
      });

    // Listen for preview section actions
    this.previewSectionService.action$
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action) {
          switch (action.action) {
            case "modify":
              this.showBuildChoiceModal();
              break;
            case "saveToToolbox":
              this.saveToToolboxDialog();
              break;
            case "addToAppStore":
              this.saveToAppStoreDialog();
              break;
            case "save": // Keep for backward compatibility
              this.saveToToolboxDialog();
              break;
            case "clear":
              this.clearPreview();
              break;
          }
          this.previewSectionService.resetAction();
        }
      });
  }

  /**
   * Setup subscriptions to service events
   */
  private setupServiceSubscriptions(): void {
    // Handle project load events
    this.toolboxService.projectLoad$
      .pipe(takeUntil(this.destroy$))
      .subscribe((project) => {
        if (project) {
          this.loadProjectFromService(project);
        }
      });

    // Handle project delete events
    this.toolboxService.projectDelete$
      .pipe(takeUntil(this.destroy$))
      .subscribe((project) => {
        if (project) {
          this.deleteProjectFromService(project);
        }
      });

    // Handle command input state changes
    this.commandInputService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.userCommand = state.userCommand;
        this.isProcessing = state.isProcessing;
        this.isListening = state.isListening;
        this.voiceSupported = state.voiceSupported;
      });

    // Handle command actions
    this.commandActionsService.actions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((action: CommandAction) => {
        this.handleCommandAction(action);
      });

    // Update speech recognition language when language changes
    this.translationService.selectedLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((languageCode) => {
        // Voice language is now handled automatically by WhisperVoiceService
        console.log(`Language changed to: ${languageCode}`);
      });
  }

  /**
   * Setup voice modal subscriptions
   */
  private setupVoiceModalSubscriptions(): void {
    // Subscribe to voice modal state
    this.voiceActionService.voiceModalState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.showVoiceModal = state.isOpen;
      });

    // Subscribe to voice transcription results
    this.voiceActionService.voiceTranscription$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.context === "main-input") {
          // The command input service is already updated by the voice action service
          // We can add any additional handling here if needed
        }
        // Close voice modal
        this.showVoiceModal = false;
      });
  }

  /**
   * Handle command actions from the input section
   */
  private handleCommandAction(action: CommandAction): void {
    switch (action.type) {
      case "PROCESS_COMMAND":
        this.processCommand();
        break;
      case "SET_EXAMPLE":
        this.setExampleCommand();
        break;
      case "START_VOICE":
        this.startVoiceInput();
        break;
      case "TEST_STATIC":
        this.testStaticPreview();
        break;
      case "TEST_BLOB":
        this.testBlobUrl();
        break;
    }
  }

  /**
   * Process user command and generate mini app
   */
  processCommand(): void {
    const currentCommand = this.commandInputService.currentState.userCommand;
    if (!currentCommand.trim()) {
      this.errorMessage = "Please enter a command!";
      return;
    }

    this.commandInputService.setProcessing(true);
    this.errorMessage = "";
    this.currentApp = null;
    this.sourceProject = null;

    // Set loading state in preview section
    this.previewSectionService.setLoading(true);

    // For debugging: bypass OpenAI and use static HTML
    if (
      currentCommand.toLowerCase().includes("test") ||
      currentCommand.toLowerCase().includes("debug")
    ) {
      this.testStaticPreview();
      this.commandInputService.setProcessing(false);

      // Clear loading state in preview section
      this.previewSectionService.setLoading(false);
      return;
    }

    this.promptProcessor.processCommand(currentCommand).subscribe({
      next: (result: ProcessedCommand) => {
        this.currentApp = result;
        // Use the raw generated code for iframe srcdoc
        this.previewHtml = result.generatedCode;
        // Create blob URL for iframe
        this.previewUrl = this.createBlobUrl(result.generatedCode);
        // Sanitize the blob URL for Angular
        this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.previewUrl
        );
        this.commandInputService.setProcessing(false);

        // Clear loading state in preview section
        this.previewSectionService.setLoading(false);

        // Update preview service
        this.updatePreviewService();

        // Switch to app view to show the preview
        this.currentView = "app";

        // Automatically open the app in full-screen popup modal
        this.appPopupService.openUserApp(
          result,
          result.projectName || "Your New App"
        );

        // Show success message
        this.showSuccessMessage(
          `Created "${result.projectName}" successfully!`
        );

        // Track successful app creation
        this.analytics.logAppCreated(
          currentCommand,
          this.selectedLanguage,
          true
        );
      },
      error: (error) => {
        console.error("Error processing command:", error);
        this.errorMessage =
          error.message ||
          "Failed to generate app. Please try again with a more specific command.";
        this.commandInputService.setProcessing(false);

        // Clear loading state in preview section
        this.previewSectionService.setLoading(false);

        // Track failed app creation
        this.analytics.logAppCreated(
          currentCommand,
          this.selectedLanguage,
          false,
          this.errorMessage
        );

        // Track general app error
        this.analytics.logAppError(
          this.errorMessage,
          "app_creation",
          error.stack
        );
        console.error("Error processing command:", error);

        // For debugging: show the error but also create a test preview
        this.testStaticPreview();
      },
    });
  }

  /**
   * Save to toolbox using dialog
   */
  saveToToolboxDialog(): void {
    if (!this.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    // Check authentication before allowing save
    if (!this.authService.isLoggedIn()) {
      this.showAuthModalWithMessage(
        `Please log in or register to save your app.`
      );
      return;
    }

    this.saveDialogService.openDialog({
      currentApp: this.currentApp,
      userCommand: this.userCommand,
      saveMode: "toolbox",
    });
  }

  /**
   * Save to App Store using dialog
   */
  saveToAppStoreDialog(): void {
    if (!this.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    const isLoggedIn = this.authService.isLoggedIn();

    // Log app store publish attempt
    this.analytics.logEvent(AnalyticsEventType.APPSTORE_PUBLISH_ATTEMPTED, {
      appstorePublishAttempted: {
        appName: "unknown", // Will be updated when user enters name
        language: this.currentApp.detectedLanguage,
        userType: isLoggedIn ? "logged_in" : "guest",
        loginPromptShown: !isLoggedIn,
      },
    });

    if (!isLoggedIn) {
      this.showAuthModalForAppStore();
      return;
    }

    // Open save dialog for App Store publishing
    this.saveDialogService.openDialog({
      currentApp: this.currentApp,
      userCommand: this.userCommand,
      saveMode: "appstore",
    });
  }

  /**
   * Save current generated app to toolbox
   */
  saveToToolbox(): void {
    if (!this.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    // Check authentication before allowing save
    if (!this.authService.isLoggedIn()) {
      this.showAuthModalWithMessage(
        `Please log in or register to save your app.`
      );
      return;
    }

    this.saveDialogService.openDialog({
      currentApp: this.currentApp,
      userCommand: this.userCommand,
      saveMode: "appstore",
    });
  }

  /**
   * Save directly to toolbox without dialog
   */
  saveToToolboxDirect(): void {
    if (!this.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    // Prompt for project name
    const projectName = prompt("Enter a name for your app:");
    if (!projectName || !projectName.trim()) {
      return; // User cancelled or didn't enter a name
    }

    const isLoggedIn = this.authService.isLoggedIn();

    // Log toolbox save attempt
    this.analytics.logEvent(AnalyticsEventType.TOOLBOX_SAVED, {
      toolboxSaved: {
        appName: projectName.trim(),
        language: this.currentApp.detectedLanguage,
        userType: isLoggedIn ? "logged_in" : "guest",
        saveMethod: isLoggedIn ? "backend" : "local_storage",
      },
    });

    // Generate unique name and save
    this.storageService
      .generateUniqueProjectName(projectName.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uniqueName) => {
          // Save project to toolbox (private, not published)
          this.storageService
            .saveProject({
              name: uniqueName,
              command: this.userCommand,
              language: this.currentApp!.detectedLanguage,
              code: this.currentApp!.generatedCode,
              isPublished: false, // Toolbox saves are always private
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (savedProject) => {
                this.toolboxService.addProject(savedProject);
                this.showSuccessMessage(
                  `Saved "${uniqueName}" to your toolbox!`
                );
              },
              error: (error) => {
                this.errorMessage =
                  "Failed to save to toolbox. Please try again.";
                console.error("Error saving to toolbox:", error);
              },
            });
        },
        error: (error) => {
          this.errorMessage =
            "Failed to generate unique name. Please try again.";
          console.error("Error generating unique name:", error);
        },
      });
  }

  /**
   * Save to App Store (public, opens dialog for project name)
   */
  saveToAppStore(): void {
    if (!this.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    const isLoggedIn = this.authService.isLoggedIn();

    // Log app store publish attempt
    this.analytics.logEvent(AnalyticsEventType.APPSTORE_PUBLISH_ATTEMPTED, {
      appstorePublishAttempted: {
        appName: "unknown", // Will be updated when user enters name
        language: this.currentApp.detectedLanguage,
        userType: isLoggedIn ? "logged_in" : "guest",
        loginPromptShown: !isLoggedIn,
      },
    });

    if (!isLoggedIn) {
      this.showAuthModalForAppStore();
      return;
    }

    // Open save dialog for App Store publishing
    this.saveDialogService.openDialog({
      currentApp: this.currentApp,
      userCommand: this.userCommand,
      saveMode: "appstore",
    });
  }

  /**
   * Show auth modal for guest users
   */
  private showAuthModalForAppStore(): void {
    const event = new CustomEvent("showAuthModal", {
      detail: {
        message: "Please log in or register to publish to the App Store.",
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Load a saved project (called by service)
   */
  private loadProjectFromService(loadedProject: SavedProject): void {
    this.storageService.getProject(loadedProject.id).subscribe((project) => {
      if (!project) return;
      this.userCommand = project.command || "";
      this.previewHtml = project.code;
      this.previewId = project.id;
      // Create blob URL for iframe
      this.previewUrl = this.createBlobUrl(project.code);
      // Sanitize the blob URL for Angular
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.previewUrl
      );

      // Create a ProcessedCommand object for consistency
      this.currentApp = {
        detectedLanguage: project.language,
        generatedCode: project.code,
        sanitizedCode: this.sanitizer.bypassSecurityTrustHtml(project.code),
        projectName: project.name,
        id: project.id,
      };

      // Update preview service
      this.updatePreviewService();

      // Switch to app view to show the preview
      this.currentView = "app";

      // Automatically open the project in full-screen popup modal
      this.appPopupService.openUserApp(this.currentApp, project.name);

      // Close toolbox
      this.toolboxService.close();
    });
  }

  /**
   * Delete a saved project (called by service)
   */
  private deleteProjectFromService(project: SavedProject): void {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.storageService
        .deleteProject(project.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.toolboxService.removeProject(project.id);

              // Clear preview if deleted project was selected
              const selectedProject = this.toolboxService.getSelectedProject();
              if (selectedProject?.id === project.id) {
                this.clearPreview();
              }
            }
          },
          error: (error) => {
            console.error("Error deleting project:", error);
            this.errorMessage = "Failed to delete project. Please try again.";
          },
        });
    }
  }

  // Legacy methods that now delegate to service
  loadProject(project: SavedProject): void {
    this.toolboxService.loadProject(project);
  }

  deleteProject(project: SavedProject): void {
    this.toolboxService.deleteProject(project);
  }

  /**
   * Toggle toolbox visibility
   */
  toggleToolbox(): void {
    this.toolboxService.toggle();
  }

  /**
   * Get toolbox button state
   */
  get showToolbox(): boolean {
    return this.toolboxService.isOpen();
  }

  /**
   * Get saved projects count for header
   */
  get savedProjectsCount(): number {
    return this.toolboxService.getSavedProjects().length;
  }

  /**
   * Clear current preview
   */
  clearPreview(): void {
    // Clear preview service (this will handle URL revocation)
    this.previewSectionService.clearPreviewData();

    // Clear local properties
    this.currentApp = null;
    this.sourceProject = null;
    this.previewHtml = "";
    this.previewId = 0;
    this.previewUrl = "";
    this.safePreviewUrl = null;
    this.commandInputService.updateUserCommand("");
    this.toolboxService.setSelectedProject(null);
    this.errorMessage = "";
  }

  /**
   * Load saved projects from storage and update service
   */
  private loadSavedProjects(): void {
    if (this.authService.isLoggedIn()) {
      this.storageService
        .getAllProjects()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (projects) => {
            this.toolboxService.setSavedProjects(projects);
          },
          error: (error) => {
            console.error("Error loading projects:", error);
            // Fallback to empty array if there's an error
            this.toolboxService.setSavedProjects([]);
          },
        });
    } else {
      // User not authenticated, set empty projects
      this.toolboxService.setSavedProjects([]);
    }
  }

  /**
   * Show success message temporarily
   */
  private showSuccessMessage(message: string): void {
    // Create a temporary success message
    const tempMessage = this.errorMessage;
    this.errorMessage = `✅ ${message}`;

    // Clear the success message after 3 seconds
    setTimeout(() => {
      if (this.errorMessage.startsWith("✅")) {
        this.errorMessage = tempMessage;
      }
    }, 3000);
  }

  /**
   * Returns example commands for the given language code, or falls back to English.
   */
  getExampleCommands(language: string = "en"): string[] {
    return EXAMPLE_COMMANDS[language] || EXAMPLE_COMMANDS["en"];
  }

  /**
   * Returns a random example command based on the user's current language.
   */
  getRandomExample(): string {
    const lang = this.selectedLanguage || "en"; // or get from user profile/service
    const examples = this.getExampleCommands(lang);
    return examples[Math.floor(Math.random() * examples.length)];
  }

  /**
   * Set a random example command based on current language.
   */
  setExampleCommand(): void {
    this.commandInputService.updateUserCommand(this.getRandomExample());
  }

  /**
   * Test with static HTML (for debugging)
   */
  testStaticPreview(): void {
    // Get test preview from service
    const testResult = this.testPreviewService.generateTestPreview();

    // Set the test result directly
    this.currentApp = testResult;
    this.previewHtml = testResult.generatedCode;
    // Try data URL instead of blob URL for testing
    const dataUrl = this.testPreviewService.getDataUrl(
      testResult.generatedCode
    );
    this.previewUrl = dataUrl;
    this.safePreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
    this.userCommand = "Test static HTML preview";

    // Update preview service
    this.updatePreviewService();
  }

  /**
   * Test blob URL creation
   */
  testBlobUrl(): void {
    const testResult = this.testPreviewService.generateBlobTestPreview();
    const blobUrl = this.testPreviewService.createBlobUrl(
      testResult.generatedCode
    );
    // Try to open the blob URL in a new window for testing
    window.open(blobUrl, "_blank");
  }

  /**
   * Create blob URL for iframe to bypass sanitization
   */
  createBlobUrl(html: string): string {
    return this.testPreviewService.createBlobUrl(html, this.previewUrl);
  }

  /**
   * Get data URL for iframe to bypass sanitization
   */
  getDataUrl(html: string): string {
    return this.testPreviewService.getDataUrl(html);
  }

  /**
   * Handle voice modal close event
   */
  onVoiceModalClose(): void {
    this.voiceActionService.closeVoiceModal();
  }

  /**
   * Handle voice transcription result
   */
  onVoiceTranscription(transcription: string): void {
    this.voiceActionService.handleVoiceTranscription(transcription);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up voice resources
    this.voiceActionService.cleanup();

    // Clean up blob URL to prevent memory leaks
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    // Clean up event listeners
    if (this.saveSuccessListener) {
      document.removeEventListener("saveSuccess", this.saveSuccessListener);
    }
    if (this.showAuthModalListener) {
      document.removeEventListener("showAuthModal", this.showAuthModalListener);
    }
    if (this.appSavedListener) {
      document.removeEventListener("appSaved", this.appSavedListener);
    }
  }
}
