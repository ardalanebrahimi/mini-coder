import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
  ModifyAppDialogService,
  ModifyDialogData,
  ModifyMode,
} from "../services/modify-app-dialog.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-modify-app-dialog",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./modify-app-dialog.component.html",
  styleUrls: ["./modify-app-dialog.component.scss"],
})
export class ModifyAppDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  showDialog = false;
  dialogData: ModifyDialogData | null = null;
  modifyCommand = "";
  isProcessing = false;
  errorMessage = "";

  // Voice input properties
  isListening = false;
  voiceSupported = false;
  speechRecognition: any = null;

  // Expose enum to template
  ModifyMode = ModifyMode;

  constructor(
    private modifyAppDialogService: ModifyAppDialogService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.initializeVoiceRecognition();

    // Subscribe to dialog visibility
    this.modifyAppDialogService.showDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((show) => {
        this.showDialog = show;
        if (!show) {
          this.resetForm();
        }
      });

    // Subscribe to dialog data
    this.modifyAppDialogService.dialogData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.dialogData = data;
        if (data) {
          this.resetForm();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
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
    this.cancelModify();
  }

  /**
   * Handle dialog content click (prevent event bubbling)
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Cancel modify operation and close dialog
   */
  cancelModify(): void {
    this.modifyAppDialogService.closeDialog();
  }

  /**
   * Process the modify/rebuild command
   */
  processCommand(): void {
    if (!this.modifyCommand.trim()) {
      this.errorMessage =
        this.dialogData?.mode === ModifyMode.REBUILD
          ? this.t("placeholderText")
          : this.t("modifyPlaceholder");
      return;
    }

    if (
      !this.dialogData?.currentApp &&
      this.dialogData?.mode === ModifyMode.MODIFY
    ) {
      this.errorMessage = "No app to modify!";
      return;
    }

    this.modifyAppDialogService.submitCommand(this.modifyCommand);
  }

  /**
   * Initialize voice recognition
   */
  private initializeVoiceRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.voiceSupported = true;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang =
        this.translationService.getCurrentLanguage() === "de"
          ? "de-DE"
          : "en-US";

      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.modifyCommand = transcript;
        this.isListening = false;
      };

      this.speechRecognition.onerror = () => {
        this.isListening = false;
        this.errorMessage = "Voice recognition failed. Please try again.";
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  /**
   * Start voice input for modify command
   */
  startVoiceInput(): void {
    if (!this.voiceSupported || this.isListening) return;

    this.isListening = true;
    this.errorMessage = "";
    this.speechRecognition.start();
  }

  /**
   * Reset form data
   */
  private resetForm(): void {
    this.modifyCommand = "";
    this.errorMessage = "";
    this.isProcessing = false;
    this.isListening = false;
  }

  /**
   * Get the appropriate placeholder text
   */
  getPlaceholderText(): string {
    return this.dialogData?.mode === ModifyMode.REBUILD
      ? this.t("placeholderText")
      : this.t("modifyPlaceholder");
  }

  /**
   * Get the appropriate label text
   */
  getLabelText(): string {
    return this.dialogData?.mode === ModifyMode.REBUILD
      ? this.t("placeholderText")
      : this.t("modifyPlaceholder");
  }

  /**
   * Get the dialog title
   */
  getDialogTitle(): string {
    return this.dialogData?.mode === ModifyMode.REBUILD
      ? this.t("rebuildApp")
      : this.t("modifyApp");
  }

  /**
   * Get the submit button text
   */
  getSubmitButtonText(): string {
    if (this.isProcessing) {
      return this.t("creating");
    }
    return this.dialogData?.mode === ModifyMode.REBUILD
      ? this.t("rebuildApp")
      : this.t("modifyApp");
  }

  /**
   * Get the appropriate emoji for the dialog
   */
  getDialogEmoji(): string {
    return this.dialogData?.mode === ModifyMode.REBUILD ? "🚀" : "🔧";
  }
}
