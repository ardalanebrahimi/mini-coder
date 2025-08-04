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
import { VoiceActionService } from "../services/voice-action.service";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "../services/analytics.service";

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
  get isProcessing(): boolean {
    return this.dialogData?.isProcessing || false;
  }
  errorMessage = "";

  // Voice input properties - simplified for new system
  voiceSupported = false;

  // Expose enum to template
  ModifyMode = ModifyMode;

  constructor(
    private modifyAppDialogService: ModifyAppDialogService,
    private translationService: TranslationService,
    private voiceActionService: VoiceActionService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    // Check if voice is supported
    this.voiceSupported = this.voiceActionService.isVoiceSupported();

    // Subscribe to dialog visibility
    this.modifyAppDialogService.showDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((show) => {
        this.showDialog = show;
        if (!show) {
          this.resetForm();
        } else {
          // Log modify app dialog shown
          this.analytics.logEvent(AnalyticsEventType.APP_MODIFIED, {
            appModified: {
              modification: "dialog_opened",
              language: "unknown", // Will be updated when actual modification happens
              success: false, // Just opening dialog
            },
          });
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

    // Subscribe to voice transcription results for this dialog
    this.voiceActionService.voiceTranscription$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.context === "modify-dialog") {
          this.modifyCommand = result.text;
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

    // Log modify app confirmation (when user clicks to actually modify)
    this.analytics.logEvent(AnalyticsEventType.APP_MODIFIED, {
      appModified: {
        modification: this.modifyCommand,
        language: this.dialogData?.currentApp?.detectedLanguage || "unknown",
        success: false, // Will be updated based on result
      },
    });

    this.modifyAppDialogService.submitCommand(this.modifyCommand);
  }

  /**
   * Start voice input for modify command
   */
  startVoiceInput(): void {
    if (!this.voiceSupported) return;

    this.errorMessage = "";
    this.voiceActionService.openVoiceModalForModifyDialog();
  }

  /**
   * Reset form data
   */
  private resetForm(): void {
    this.modifyCommand = "";
    this.errorMessage = "";
    // Note: isProcessing is now managed by the dialog service
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
