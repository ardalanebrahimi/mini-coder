import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { WhisperVoiceService } from "./whisper-voice.service";
import { CommandInputService } from "./command-input.service";
import { TranslationService } from "./translation.service";
import { AnalyticsService, AnalyticsEventType } from "./analytics.service";

export interface VoiceModalState {
  isOpen: boolean;
  context: "main-input" | "modify-dialog" | null;
}

@Injectable({
  providedIn: "root",
})
export class VoiceActionService {
  private voiceModalStateSubject = new BehaviorSubject<VoiceModalState>({
    isOpen: false,
    context: null,
  });

  public voiceModalState$ = this.voiceModalStateSubject.asObservable();

  // Event subjects
  private voiceTranscriptionSubject = new Subject<{
    text: string;
    context: string | null;
  }>();
  public voiceTranscription$ = this.voiceTranscriptionSubject.asObservable();

  constructor(
    private whisperVoiceService: WhisperVoiceService,
    private commandInputService: CommandInputService,
    private translationService: TranslationService,
    private analytics: AnalyticsService
  ) {}

  /**
   * Open voice modal for main input
   */
  openVoiceModalForMainInput(): void {
    // Log voice input button click
    this.analytics.logEvent(AnalyticsEventType.VOICE_INPUT_USED, {
      voiceInputUsed: {
        language: this.translationService.getCurrentLanguage(),
        duration: 0, // Will be updated when actual voice input completes
        success: false, // Will be updated based on result
      },
    });

    this.voiceModalStateSubject.next({
      isOpen: true,
      context: "main-input",
    });
  }

  /**
   * Open voice modal for modify dialog
   */
  openVoiceModalForModifyDialog(): void {
    // Log voice input button click in modify dialog
    this.analytics.logEvent(AnalyticsEventType.VOICE_INPUT_USED, {
      voiceInputUsed: {
        language: this.translationService.getCurrentLanguage(),
        duration: 0, // Will be updated when actual voice input completes
        success: false, // Will be updated based on result
      },
    });

    this.voiceModalStateSubject.next({
      isOpen: true,
      context: "modify-dialog",
    });
  }

  /**
   * Close voice modal
   */
  closeVoiceModal(): void {
    this.voiceModalStateSubject.next({
      isOpen: false,
      context: null,
    });
  }

  /**
   * Handle voice transcription result
   */
  handleVoiceTranscription(transcription: string): void {
    const currentState = this.voiceModalStateSubject.value;

    if (currentState.context === "main-input") {
      // Update the main command input
      this.commandInputService.updateUserCommand(transcription);
    }

    // Emit the transcription with context for other components to handle
    this.voiceTranscriptionSubject.next({
      text: transcription,
      context: currentState.context,
    });

    // Close the modal
    this.closeVoiceModal();
  }

  /**
   * Get current voice modal state
   */
  getCurrentVoiceModalState(): VoiceModalState {
    return this.voiceModalStateSubject.value;
  }

  /**
   * Check if voice is supported
   */
  isVoiceSupported(): boolean {
    return this.whisperVoiceService.isVoiceSupported();
  }

  /**
   * Initialize voice service (request permissions if needed)
   */
  async initializeVoice(): Promise<boolean> {
    return await this.whisperVoiceService.requestPermission();
  }

  /**
   * Clean up voice resources
   */
  cleanup(): void {
    this.whisperVoiceService.cleanup();
    this.closeVoiceModal();
  }
}
