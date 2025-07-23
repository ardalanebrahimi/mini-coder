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
import { ToolboxService } from "./services/toolbox.service";
import { TranslationService } from "./services/translation.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule, ToolboxComponent],
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

  // UI state
  showSaveDialog = false;
  saveProjectName = "";

  // Modify app feature
  showModifyDialog = false;
  modifyCommand = "";
  isModifying = false;
  isRebuilding = false;

  // Voice input feature
  isListening = false;
  speechRecognition: any = null;
  voiceSupported = false;

  // Rebuild vs modify choice
  showBuildChoiceDialog = false;
  pendingModifyCommand = "";

  constructor(
    private promptProcessor: PromptProcessorService,
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
    private toolboxService: ToolboxService,
    private translationService: TranslationService
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
    this.showModifyDialog = true;
    this.modifyCommand = "";
    this.errorMessage = "";
    this.isRebuilding = false;
  }

  /**
   * Cancel modify app dialog
   */
  cancelModifyApp(): void {
    this.showModifyDialog = false;
    this.modifyCommand = "";
    this.errorMessage = "";
    this.isRebuilding = false;
  }

  /**
   * Process modify command to update current app
   */
  processModifyCommand(): void {
    if (!this.modifyCommand.trim()) {
      this.errorMessage = this.t("modifyPlaceholder");
      return;
    }

    if (!this.currentApp && !this.isRebuilding) {
      this.errorMessage = "No app to modify!";
      return;
    }

    this.isModifying = true;
    this.errorMessage = "";

    console.log("Processing modify command:", this.modifyCommand);
    console.log("Is rebuilding:", this.isRebuilding);

    // Choose prompt based on whether we're rebuilding or modifying
    const prompt = this.isRebuilding
      ? this.modifyCommand // For rebuild, use the command directly
      : `${this.userCommand}\n\nCurrent app requirements. Now modify it: ${this.modifyCommand}`; // For modify, combine with original

    this.promptProcessor.processCommand(prompt).subscribe({
      next: (result: ProcessedCommand) => {
        console.log("Modified/Rebuilt app result:", result);

        // Update current app with modified/rebuilt version
        this.currentApp = result;
        this.previewHtml = result.generatedCode;

        // If rebuilding, update the original command too
        if (this.isRebuilding) {
          this.userCommand = this.modifyCommand;
        }

        // Create new blob URL for modified app
        this.previewUrl = this.createBlobUrl(result.generatedCode);
        this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.previewUrl
        );

        this.isModifying = false;
        this.showModifyDialog = false;
        this.modifyCommand = "";
        this.isRebuilding = false;

        // Show success message
        const successMessage = this.isRebuilding
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
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.maxAlternatives = 1;

      // Set language based on selected UI language
      this.speechRecognition.lang =
        this.selectedLanguage === "de" ? "de-DE" : "en-US";

      this.speechRecognition.onstart = () => {
        this.isListening = true;
        console.log("Voice recognition started");
      };

      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice input received:", transcript);
        this.userCommand = transcript;
        this.isListening = false;
      };

      this.speechRecognition.onerror = (event: any) => {
        console.error("Voice recognition error:", event.error);
        this.isListening = false;
        this.errorMessage = this.t("voiceNotSupported");
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        console.log("Voice recognition ended");
      };
    } else {
      this.voiceSupported = false;
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
  startVoiceInputForModify(): void {
    if (!this.voiceSupported || !this.speechRecognition) {
      this.errorMessage = this.t("voiceNotSupported");
      return;
    }

    // Update language before starting
    this.speechRecognition.lang =
      this.selectedLanguage === "de" ? "de-DE" : "en-US";

    // Temporarily update the result handler for modify command
    this.speechRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice input for modify received:", transcript);
      this.modifyCommand = transcript;
      this.isListening = false;
    };

    try {
      this.speechRecognition.start();
      this.errorMessage = "";
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      this.errorMessage = this.t("voiceNotSupported");
    }
  }

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
    this.showBuildChoiceDialog = true;
    this.pendingModifyCommand = "";
    this.errorMessage = "";
  }

  /**
   * Cancel build choice dialog
   */
  cancelBuildChoice(): void {
    this.showBuildChoiceDialog = false;
    this.pendingModifyCommand = "";
  }

  /**
   * Choose to modify existing app
   */
  chooseModifyExisting(): void {
    this.showBuildChoiceDialog = false;
    this.showModifyAppDialog();
  }

  /**
   * Choose to rebuild from scratch
   */
  chooseRebuildFromScratch(): void {
    this.showBuildChoiceDialog = false;
    this.showRebuildDialog();
  }

  /**
   * Show rebuild dialog
   */
  showRebuildDialog(): void {
    this.showModifyDialog = true;
    this.modifyCommand = "";
    this.errorMessage = "";
    // Set a flag to indicate we're rebuilding, not modifying
    this.isRebuilding = true;
  }

  ngOnInit(): void {
    this.loadSavedProjects();
    this.initializeVoiceRecognition();
    this.setupServiceSubscriptions();
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
   * Process user command and generate mini app
   */
  processCommand(): void {
    if (!this.userCommand.trim()) {
      this.errorMessage = "Please enter a command!";
      return;
    }

    this.isProcessing = true;
    this.errorMessage = "";
    this.currentApp = null;

    console.log("Processing command:", this.userCommand);

    // For debugging: bypass OpenAI and use static HTML
    if (
      this.userCommand.toLowerCase().includes("test") ||
      this.userCommand.toLowerCase().includes("debug")
    ) {
      console.log("Using test mode - bypassing OpenAI");
      this.testStaticPreview();
      this.isProcessing = false;
      return;
    }

    this.promptProcessor.processCommand(this.userCommand).subscribe({
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
        this.saveProjectName = result.projectName;
        this.isProcessing = false;

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
        this.isProcessing = false;
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

    this.showSaveDialog = true;
  }

  /**
   * Confirm save with custom name
   */
  confirmSave(): void {
    if (!this.saveProjectName.trim()) {
      this.errorMessage = "Please enter a project name!";
      return;
    }

    if (!this.currentApp) {
      this.errorMessage = "No app to save!";
      return;
    }

    try {
      // Generate unique name if needed
      const uniqueName = this.storageService.generateUniqueProjectName(
        this.saveProjectName
      );

      const savedProject = this.storageService.saveProject({
        name: uniqueName,
        command: this.userCommand,
        language: this.currentApp.detectedLanguage,
        code: this.currentApp.generatedCode,
      });

      // Update the toolbox service with the new project
      this.toolboxService.addProject(savedProject);

      this.showSaveDialog = false;
      this.saveProjectName = "";
      this.errorMessage = "";

      // Show success message
      this.showSuccessMessage(`Saved "${uniqueName}" to your toolbox!`);
    } catch (error) {
      this.errorMessage = "Failed to save project. Please try again.";
      console.error("Error saving project:", error);
    }
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
   * Cancel save dialog
   */
  cancelSave(): void {
    this.showSaveDialog = false;
    this.saveProjectName = "";
    this.errorMessage = "";
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
    this.userCommand = this.getRandomExample();
  }

  /**
   * Test with static HTML (for debugging)
   */
  testStaticPreview(): void {
    const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Calculator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            margin-bottom: 20px;
            font-size: 2em;
        }
        .calculator {
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            margin: 20px auto;
            max-width: 300px;
        }
        .display {
            background: #333;
            color: #0ff;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 5px;
            font-size: 1.5em;
            text-align: right;
            min-height: 30px;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        button {
            padding: 20px;
            font-size: 1.2em;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #555;
            color: white;
        }
        button:hover {
            background: #666;
            transform: scale(1.05);
        }
        .operator {
            background: #ff6b6b !important;
        }
        .operator:hover {
            background: #ff5252 !important;
        }
        .equals {
            background: #4CAF50 !important;
        }
        .equals:hover {
            background: #45a049 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧮 Test Calculator</h1>
        <div class="calculator">
            <div class="display" id="display">0</div>
            <div class="buttons">
                <button onclick="clearDisplay()">C</button>
                <button onclick="appendToDisplay('/')" class="operator">÷</button>
                <button onclick="appendToDisplay('*')" class="operator">×</button>
                <button onclick="backspace()">⌫</button>
                
                <button onclick="appendToDisplay('7')">7</button>
                <button onclick="appendToDisplay('8')">8</button>
                <button onclick="appendToDisplay('9')">9</button>
                <button onclick="appendToDisplay('-')" class="operator">-</button>
                
                <button onclick="appendToDisplay('4')">4</button>
                <button onclick="appendToDisplay('5')">5</button>
                <button onclick="appendToDisplay('6')">6</button>
                <button onclick="appendToDisplay('+')" class="operator">+</button>
                
                <button onclick="appendToDisplay('1')">1</button>
                <button onclick="appendToDisplay('2')">2</button>
                <button onclick="appendToDisplay('3')">3</button>
                <button onclick="calculate()" class="equals">=</button>
                
                <button onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
                <button onclick="appendToDisplay('.')">.</button>
                <button onclick="testAlert()" style="grid-column: span 1; background: #9c27b0;">Test</button>
            </div>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '0';

        function updateDisplay() {
            display.textContent = currentInput;
        }

        function appendToDisplay(value) {
            if (currentInput === '0' && value !== '.') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }

        function clearDisplay() {
            currentInput = '0';
            updateDisplay();
        }

        function backspace() {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }

        function calculate() {
            try {
                let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                let result = eval(expression);
                currentInput = result.toString();
                updateDisplay();
            } catch (error) {
                currentInput = 'Error';
                updateDisplay();
                setTimeout(() => {
                    clearDisplay();
                }, 1500);
            }
        }

        function testAlert() {
            alert('Calculator is working! Preview iframe is functional.');
        }

        // Add keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                appendToDisplay(key);
            } else if (key === '.') {
                appendToDisplay('.');
            } else if (key === '+' || key === '-') {
                appendToDisplay(key);
            } else if (key === '*') {
                appendToDisplay('*');
            } else if (key === '/') {
                event.preventDefault();
                appendToDisplay('/');
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                backspace();
            }
        });

        console.log('Calculator script loaded successfully!');
    </script>
</body>
</html>`;

    // Create a mock ProcessedCommand for testing
    const testResult: ProcessedCommand = {
      detectedLanguage: "en",
      generatedCode: testHtml,
      sanitizedCode: this.sanitizer.bypassSecurityTrustHtml(testHtml),
      projectName: "Test Calculator",
    };

    // Set the test result directly
    this.currentApp = testResult;
    this.previewHtml = testHtml;
    // Try data URL instead of blob URL for testing
    const dataUrl = this.getDataUrl(testHtml);
    this.previewUrl = dataUrl;
    this.safePreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
    this.userCommand = "Test static HTML preview";
    this.saveProjectName = "Test Calculator";

    console.log("Test static preview set");
    console.log("Preview URL:", this.previewUrl);
    console.log("Safe Preview URL:", this.safePreviewUrl);
    console.log("Data URL length:", dataUrl.length);
  }

  /**
   * Test blob URL creation
   */
  testBlobUrl(): void {
    const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Blob URL Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Blob URL Test</h1>
        <p>This is a test to verify blob URL creation is working.</p>
        <button onclick="alert('Blob URL test successful!')">Test Alert</button>
    </div>
    <script>
        console.log('Blob URL test page loaded successfully!');
    </script>
</body>
</html>`;

    const blobUrl = this.createBlobUrl(testHtml);
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
    if (!html) {
      console.warn("No HTML provided to createBlobUrl");
      return "";
    }

    console.log("Creating blob URL for HTML length:", html.length);
    console.log("HTML preview:", html.substring(0, 200) + "...");

    // Revoke previous blob URL to prevent memory leaks
    if (this.previewUrl) {
      console.log("Revoking previous blob URL:", this.previewUrl);
      URL.revokeObjectURL(this.previewUrl);
    }

    try {
      // Create blob with HTML content
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      console.log("Created blob URL:", blobUrl);
      console.log("Blob size:", blob.size);
      return blobUrl;
    } catch (error) {
      console.error("Error creating blob URL:", error);
      return "";
    }
  }

  /**
   * Get data URL for iframe to bypass sanitization
   */
  getDataUrl(html: string): string {
    if (!html) {
      console.warn("No HTML provided to getDataUrl");
      return "";
    }

    console.log("Creating data URL for HTML length:", html.length);
    console.log("HTML preview:", html.substring(0, 200) + "...");

    try {
      // Encode the HTML as a data URL
      const encodedHtml = encodeURIComponent(html);
      const dataUrl = `data:text/html;charset=utf-8,${encodedHtml}`;
      console.log("Created data URL length:", dataUrl.length);
      return dataUrl;
    } catch (error) {
      console.error("Error creating data URL:", error);
      return "";
    }
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
