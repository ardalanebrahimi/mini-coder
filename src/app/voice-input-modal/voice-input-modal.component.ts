import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
  WhisperVoiceService,
  VoiceRecordingState,
  VoiceTranscriptionResult,
  VoiceError,
} from "../services/whisper-voice.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-voice-input-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./voice-input-modal.component.html",
  styleUrls: ["./voice-input-modal.component.scss"],
})
export class VoiceInputModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() transcriptionResult = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  // Voice state
  voiceState: VoiceRecordingState = {
    isRecording: false,
    isProcessing: false,
    hasPermission: false,
    isListening: false,
    recordingTime: 0,
    maxRecordingTime: 15000,
    animationState: "idle",
    supportedLanguages: [],
    currentLanguage: "en",
  };

  // UI state
  lastTranscription = "";
  errorMessage = "";
  showTranscriptionConfirm = false;

  // Sound effects (can be enhanced with actual audio files)
  private audioContext: AudioContext | null = null;

  constructor(
    private whisperVoiceService: WhisperVoiceService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to voice service state
    this.whisperVoiceService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.voiceState = state;
        this.cdr.detectChanges(); // Trigger change detection
      });

    // Subscribe to transcription results
    this.whisperVoiceService.transcription$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.handleTranscriptionResult(result);
        this.cdr.detectChanges(); // Trigger change detection
      });

    // Subscribe to errors
    this.whisperVoiceService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.handleVoiceError(error);
        this.cdr.detectChanges(); // Trigger change detection
      });

    // Subscribe to recording events for sound effects
    this.whisperVoiceService.recordingStart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.playStartSound();
      });

    this.whisperVoiceService.recordingStop$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.playStopSound();
      });

    // Initialize audio context for sound effects
    this.initializeAudioContext();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.whisperVoiceService.cleanup();
  }

  /**
   * Get translation for current language
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  /**
   * Handle modal overlay click (close dialog)
   */
  onOverlayClick(): void {
    this.closeVoiceModal();
  }

  /**
   * Handle modal content click (prevent event bubbling)
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Start voice recording
   */
  async startRecording(): Promise<void> {
    this.clearMessages();

    // Check if voice is supported
    if (!this.whisperVoiceService.isVoiceSupported()) {
      this.showError("voiceNotSupported");
      return;
    }

    try {
      await this.whisperVoiceService.startRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      this.showError("recordingFailed");
    }
  }

  /**
   * Stop voice recording
   */
  stopRecording(): void {
    this.whisperVoiceService.stopRecording();
  }

  /**
   * Cancel recording and close modal
   */
  cancelRecording(): void {
    this.whisperVoiceService.cancelRecording();
    this.closeVoiceModal();
  }

  /**
   * Handle transcription result
   */
  private handleTranscriptionResult(result: VoiceTranscriptionResult): void {
    this.lastTranscription = result.transcription;
    this.showTranscriptionConfirm = true;
    this.playSuccessSound();
    this.cdr.detectChanges(); // Ensure UI updates immediately
  }

  /**
   * Handle voice error
   */
  private handleVoiceError(error: VoiceError): void {
    this.errorMessage = error.friendlyMessage;
    this.playErrorSound();
    this.cdr.detectChanges(); // Ensure UI updates immediately
  }

  /**
   * Confirm and use transcription
   */
  confirmTranscription(): void {
    if (this.lastTranscription.trim()) {
      this.transcriptionResult.emit(this.lastTranscription.trim());
      this.closeVoiceModal();
    }
  }

  /**
   * Try recording again
   */
  tryAgain(): void {
    this.clearMessages();
    this.showTranscriptionConfirm = false;
    this.startRecording();
  }

  /**
   * Close the voice modal
   */
  closeVoiceModal(): void {
    this.whisperVoiceService.cancelRecording();
    this.clearMessages();
    this.closeModal.emit();
  }

  /**
   * Clear all messages and reset UI
   */
  private clearMessages(): void {
    this.errorMessage = "";
    this.lastTranscription = "";
    this.showTranscriptionConfirm = false;
  }

  /**
   * Show error message
   */
  private showError(messageKey: string): void {
    this.errorMessage = this.t(messageKey);
  }

  /**
   * Get recording time as a formatted string
   */
  getRecordingTimeText(): string {
    const seconds = Math.ceil(this.voiceState.recordingTime / 1000);
    const maxSeconds = Math.ceil(this.voiceState.maxRecordingTime / 1000);
    return `${seconds}s / ${maxSeconds}s`;
  }

  /**
   * Get recording progress percentage
   */
  getRecordingProgress(): number {
    return (
      (this.voiceState.recordingTime / this.voiceState.maxRecordingTime) * 100
    );
  }

  /**
   * Get current status message
   */
  getStatusMessage(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }

    if (this.showTranscriptionConfirm) {
      return this.t("weHeard");
    }

    switch (this.voiceState.animationState) {
      case "recording":
        return this.t("speakNow");
      case "processing":
        return this.t("processing");
      case "success":
        return this.t("transcriptionReady");
      case "error":
        return this.errorMessage || this.t("tryAgain");
      default:
        return this.t("readyToListen");
    }
  }

  /**
   * Get button text based on current state
   */
  getMainButtonText(): string {
    if (this.showTranscriptionConfirm) {
      return this.t("useThis");
    }

    if (this.voiceState.isRecording) {
      return this.t("stopRecording");
    }

    if (this.voiceState.isProcessing) {
      return this.t("processing");
    }

    return this.t("startRecording");
  }

  /**
   * Check if main button should be disabled
   */
  isMainButtonDisabled(): boolean {
    return this.voiceState.isProcessing;
  }

  /**
   * Get main button action
   */
  onMainButtonClick(): void {
    if (this.showTranscriptionConfirm) {
      this.confirmTranscription();
    } else if (this.voiceState.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  /**
   * Initialize audio context for sound effects
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Audio context not supported:", error);
    }
  }

  /**
   * Play start recording sound
   */
  private playStartSound(): void {
    this.playTone(800, 0.1, 0.1);
  }

  /**
   * Play stop recording sound
   */
  private playStopSound(): void {
    this.playTone(400, 0.1, 0.05);
  }

  /**
   * Play success sound
   */
  private playSuccessSound(): void {
    this.playTone(600, 0.1, 0.05);
    setTimeout(() => this.playTone(800, 0.1, 0.05), 100);
  }

  /**
   * Play error sound
   */
  private playErrorSound(): void {
    this.playTone(200, 0.2, 0.1);
  }

  /**
   * Play a tone with given frequency and duration
   */
  private playTone(
    frequency: number,
    duration: number,
    volume: number = 0.1
  ): void {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Error playing sound:", error);
    }
  }

  /**
   * Get microphone icon based on state
   */
  getMicrophoneIcon(): string {
    switch (this.voiceState.animationState) {
      case "recording":
        return "🔴";
      case "processing":
        return "⏳";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "🎤";
    }
  }

  /**
   * Get animation class for microphone button
   */
  getMicrophoneAnimationClass(): string {
    switch (this.voiceState.animationState) {
      case "recording":
        return "recording-pulse";
      case "processing":
        return "processing-spin";
      case "success":
        return "success-bounce";
      case "error":
        return "error-shake";
      default:
        return "";
    }
  }
}
