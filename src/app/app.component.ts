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
import { ToolboxComponent } from "./toolbox/toolbox.component";
import { InputSectionComponent } from "./input-section/input-section.component";
import { SaveDialogComponent } from "./save-dialog/save-dialog.component";
import { BuildChoiceDialogComponent } from "./build-choice-dialog/build-choice-dialog.component";
import { ModifyAppDialogComponent } from "./modify-app-dialog/modify-app-dialog.component";
import { ToolboxService } from "./services/toolbox.service";
import { TranslationService } from "./services/translation.service";
import { TestPreviewService } from "./services/test-preview.service";
import { CommandInputService } from "./services/command-input.service";
import { SaveDialogService } from "./services/save-dialog.service";
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
  previewUrl = ""; // For blob URL
  safePreviewUrl: any = null; // For sanitized blob URL

  // UI state - removed save dialog related properties

  // Modify app feature
  isModifying = false;

  // Voice input feature
  isListening = false;
  speechRecognition: any = null;
  voiceSupported = false;

  // Rebuild vs modify choice
  // UI state - removed build choice dialog related properties

  constructor(
    private promptProcessor: PromptProcessorService,
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
    private toolboxService: ToolboxService,
    private translationService: TranslationService,
    private testPreviewService: TestPreviewService,
    private commandInputService: CommandInputService,
    private commandActionsService: CommandActionsService,
    private saveDialogService: SaveDialogService,
    private buildChoiceDialogService: BuildChoiceDialogService,
    private modifyAppDialogService: ModifyAppDialogService
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

    // Update speech recognition language if supported
    if (this.voiceSupported && this.speechRecognition) {
      this.speechRecognition.lang = languageCode === "de" ? "de-DE" : "en-US";
    }

    console.log("Changed language to:", languageCode);
  }

  /**
   * Show modify app dialog
   */
  showModifyAppDialog(): void {
    this.modifyAppDialogService.openModifyDialog(
      this.currentApp,
      this.userCommand
    );
  }

  /**
   * Process modify/rebuild command with given parameters
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

    console.log("Processing modify command:", command);
    console.log("Is rebuilding:", isRebuilding);

    // Choose prompt based on whether we're rebuilding or modifying
    const prompt = isRebuilding
      ? command // For rebuild, use the command directly
      : `${this.userCommand}\n\nCurrent app requirements. Now modify it: ${command}`; // For modify, combine with original

    this.promptProcessor.processCommand(prompt).subscribe({
      next: (result: ProcessedCommand) => {
        console.log("Modified/Rebuilt app result:", result);

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

        // Show success message
        const successMessage = isRebuilding
          ? `${this.t("rebuildApp")} successful!`
          : `${this.t("modifyApp")} successful!`;
        this.showSuccessMessage(successMessage);

        console.log("App modified/rebuilt successfully");
      },
      error: (error) => {
        console.error("Error modifying/rebuilding app:", error);
        this.errorMessage =
          error.message || "Failed to modify app. Please try again.";
        this.isModifying = false;
      },
    });
  }

  /**
   * Initialize voice recognition
   */
  initializeVoiceRecognition(): void {
    // Check if speech recognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.voiceSupported = true;
      this.commandInputService.setVoiceSupported(true);
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.maxAlternatives = 1;

      // Set language based on selected UI language
      this.speechRecognition.lang =
        this.selectedLanguage === "de" ? "de-DE" : "en-US";

      this.speechRecognition.onstart = () => {
        this.commandInputService.setListening(true);
        console.log("Voice recognition started");
      };

      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice input received:", transcript);
        this.commandInputService.updateUserCommand(transcript);
        this.commandInputService.setListening(false);
      };

      this.speechRecognition.onerror = (event: any) => {
        console.error("Voice recognition error:", event.error);
        this.commandInputService.setListening(false);
        this.errorMessage = this.t("voiceNotSupported");
      };

      this.speechRecognition.onend = () => {
        this.commandInputService.setListening(false);
        console.log("Voice recognition ended");
      };
    } else {
      this.voiceSupported = false;
      this.commandInputService.setVoiceSupported(false);
      console.log("Speech recognition not supported");
    }
  }

  /**
   * Start voice input
   */
  startVoiceInput(): void {
    if (!this.voiceSupported || !this.speechRecognition) {
      this.errorMessage = this.t("voiceNotSupported");
      return;
    }

    // Update language before starting
    this.speechRecognition.lang =
      this.selectedLanguage === "de" ? "de-DE" : "en-US";

    try {
      this.speechRecognition.start();
      this.errorMessage = "";
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      this.errorMessage = this.t("voiceNotSupported");
    }
  }

  /**
   * Start voice input for modify command
   */

  /**
   * Stop voice input
   */
  stopVoiceInput(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
    }
  }

  /**
   * Show build choice dialog (modify vs rebuild)
   */
  showBuildChoiceModal(): void {
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

  ngOnInit(): void {
    this.loadSavedProjects();
    this.initializeVoiceRecognition();
    this.setupServiceSubscriptions();

    // Listen for save success events from the save dialog component
    document.addEventListener("saveSuccess", (event: any) => {
      this.showSuccessMessage(event.detail.message);
    });

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
        if (this.voiceSupported && this.speechRecognition) {
          this.speechRecognition.lang =
            languageCode === "de" ? "de-DE" : "en-US";
        }
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

    console.log("Processing command:", currentCommand);

    // For debugging: bypass OpenAI and use static HTML
    if (
      currentCommand.toLowerCase().includes("test") ||
      currentCommand.toLowerCase().includes("debug")
    ) {
      console.log("Using test mode - bypassing OpenAI");
      this.testStaticPreview();
      this.commandInputService.setProcessing(false);
      return;
    }

    this.promptProcessor.processCommand(currentCommand).subscribe({
      next: (result: ProcessedCommand) => {
        console.log("Generated app result:", result);
        console.log(
          "Generated code preview:",
          result.generatedCode.substring(0, 300) + "..."
        );

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

        // Show success message
        this.showSuccessMessage(
          `Created "${result.projectName}" successfully!`
        );

        // Log what's being set for iframe
        console.log(
          "Setting previewHtml for iframe, length:",
          this.previewHtml.length
        );
        console.log(
          "PreviewHtml includes DOCTYPE:",
          this.previewHtml.includes("<!DOCTYPE html>")
        );
        console.log(
          "PreviewHtml includes script tags:",
          this.previewHtml.includes("<script>")
        );
        console.log(
          "PreviewHtml includes style tags:",
          this.previewHtml.includes("<style>")
        );
        console.log("Created blob URL:", this.previewUrl);
        console.log("Sanitized blob URL:", this.safePreviewUrl);
      },
      error: (error) => {
        console.error("Error processing command:", error);
        this.errorMessage =
          error.message ||
          "Failed to generate app. Please try again with a more specific command.";
        this.commandInputService.setProcessing(false);
        console.error("Error processing command:", error);

        // For debugging: show the error but also create a test preview
        console.log("Creating test preview due to error");
        this.testStaticPreview();
      },
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

    this.saveDialogService.openDialog({
      currentApp: this.currentApp,
      userCommand: this.userCommand,
    });
  }

  /**
   * Load a saved project (called by service)
   */
  private loadProjectFromService(project: SavedProject): void {
    this.userCommand = project.command;
    this.previewHtml = project.code;
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
    };

    // Close toolbox
    this.toolboxService.close();

    console.log("Loaded project:", project.name);
    console.log("Preview HTML length:", this.previewHtml.length);
  }

  /**
   * Delete a saved project (called by service)
   */
  private deleteProjectFromService(project: SavedProject): void {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.storageService.deleteProject(project.id);
      this.toolboxService.removeProject(project.id);

      // Clear preview if deleted project was selected
      const selectedProject = this.toolboxService.getSelectedProject();
      if (selectedProject?.id === project.id) {
        this.clearPreview();
      }
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
    // Revoke old blob URL to prevent memory leaks
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.currentApp = null;
    this.previewHtml = "";
    this.previewUrl = "";
    this.safePreviewUrl = null;
    this.userCommand = "";
    this.toolboxService.setSelectedProject(null);
    this.errorMessage = "";
  }

  /**
   * Load saved projects from storage and update service
   */
  private loadSavedProjects(): void {
    const projects = this.storageService.getAllProjects();
    this.toolboxService.setSavedProjects(projects);
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
   * Get example commands for placeholder
   */
  getExampleCommands(): string[] {
    return [
      "Create a working calculator with all basic operations",
      "Make an interactive animal quiz with 5 questions and scoring",
      "Build a color guessing game with random colors and points",
      "Create a simple drawing app with different colors and brush sizes",
      "Make a memory card game with flip animations",
      "Build a timer app with start, stop, and reset functions",
      "Create a to-do list with add, delete, and check-off features",
      "Make a dice rolling app with animations",
      "Build a simple piano with clickable keys that play sounds",
      "Create a word counter tool that counts characters and words",
      "Erstelle einen funktionierenden Taschenrechner mit allen Grundrechenarten",
      "Mache ein interaktives Tier-Quiz mit 5 Fragen und Punktesystem",
      "Baue ein Farben-Ratespiel mit zufälligen Farben und Punkten",
      "Erstelle eine einfache Zeichen-App mit verschiedenen Farben",
      "Mache ein Memory-Spiel mit Flip-Animationen",
      "Baue eine Timer-App mit Start-, Stopp- und Reset-Funktionen",
    ];
  }

  /**
   * Get random example command
   */
  getRandomExample(): string {
    const examples = this.getExampleCommands();
    return examples[Math.floor(Math.random() * examples.length)];
  }

  /**
   * Set example command
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

    console.log("Test static preview set");
    console.log("Preview URL:", this.previewUrl);
    console.log("Safe Preview URL:", this.safePreviewUrl);
    console.log("Data URL length:", dataUrl.length);
  }

  /**
   * Test blob URL creation
   */
  testBlobUrl(): void {
    const testResult = this.testPreviewService.generateBlobTestPreview();
    const blobUrl = this.testPreviewService.createBlobUrl(
      testResult.generatedCode
    );
    console.log("Test blob URL created:", blobUrl);

    // Try to open the blob URL in a new window for testing
    window.open(blobUrl, "_blank");
  }

  /**
   * Handle iframe load event for debugging
   */
  onIframeLoad(event: any): void {
    console.log("Iframe loaded successfully");
    console.log("Event:", event);
    console.log("Event target:", event.target);
    console.log("Event target src:", event.target.src);
    console.log("Event target sandbox:", event.target.sandbox);

    const iframe = event.target;
    try {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        console.log("Iframe document accessible");
        console.log("Iframe document title:", iframeDocument.title);
        console.log("Iframe document URL:", iframeDocument.URL);
        console.log("Iframe document readyState:", iframeDocument.readyState);
        console.log(
          "Iframe document body innerHTML length:",
          iframeDocument.body?.innerHTML?.length || 0
        );
        console.log(
          "Iframe document has script tags:",
          iframeDocument.querySelectorAll("script").length
        );
        console.log(
          "Iframe document has style tags:",
          iframeDocument.querySelectorAll("style").length
        );
        console.log(
          "Iframe document body preview:",
          iframeDocument.body?.innerHTML?.substring(0, 200) || "No body content"
        );
      } else {
        console.log("Iframe document not accessible");
      }
    } catch (error) {
      console.log(
        "Cannot access iframe content (security restrictions):",
        error
      );
    }
  }

  /**
   * Handle iframe error event
   */
  onIframeError(event: any): void {
    console.error("Iframe error:", event);
    console.error("Iframe error event target:", event.target);
    console.error("Iframe error event type:", event.type);
    this.errorMessage =
      "Failed to load app preview. Check console for details.";
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up blob URL to prevent memory leaks
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
