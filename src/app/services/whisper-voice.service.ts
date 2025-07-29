import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { TranslationService } from "./translation.service";

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  hasPermission: boolean;
  isListening: boolean;
  recordingTime: number;
  maxRecordingTime: number;
  animationState: "idle" | "recording" | "processing" | "success" | "error";
  supportedLanguages: string[];
  currentLanguage: string;
}

export interface VoiceTranscriptionResult {
  transcription: string;
  confidence: number;
  language: string;
  duration: number;
}

export interface VoiceError {
  type: "permission" | "recording" | "network" | "api" | "timeout" | "unknown";
  message: string;
  friendlyMessage: string;
}

@Injectable({
  providedIn: "root",
})
export class WhisperVoiceService {
  private readonly WHISPER_API_URL =
    "https://api.openai.com/v1/audio/transcriptions";
  private readonly MAX_RECORDING_TIME = 15000; // 15 seconds
  private readonly RECORDING_CHECK_INTERVAL = 100; // 100ms

  // Supported languages for Whisper API
  private readonly SUPPORTED_LANGUAGES = [
    "en",
    "de",
    "es",
    "fr",
    "it",
    "pt",
    "ru",
    "ja",
    "ko",
    "zh",
  ];

  // Media recording objects
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private recordingTimer: any = null;
  private recordingInterval: any = null;

  // State management
  private stateSubject = new BehaviorSubject<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    hasPermission: false,
    isListening: false,
    recordingTime: 0,
    maxRecordingTime: this.MAX_RECORDING_TIME,
    animationState: "idle",
    supportedLanguages: this.SUPPORTED_LANGUAGES,
    currentLanguage: "en",
  });

  // Event subjects
  private transcriptionSubject = new Subject<VoiceTranscriptionResult>();
  private errorSubject = new Subject<VoiceError>();
  private recordingStartSubject = new Subject<void>();
  private recordingStopSubject = new Subject<void>();

  // Public observables
  public state$ = this.stateSubject.asObservable();
  public transcription$ = this.transcriptionSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public recordingStart$ = this.recordingStartSubject.asObservable();
  public recordingStop$ = this.recordingStopSubject.asObservable();

  constructor(
    private http: HttpClient,
    private translationService: TranslationService
  ) {
    // Initialize with current UI language
    this.updateCurrentLanguage();

    // Listen for language changes
    this.translationService.selectedLanguage$.subscribe((lang: string) => {
      this.updateCurrentLanguage();
    });
  }

  /**
   * Check if voice recording is supported in the current browser
   */
  isVoiceSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      MediaRecorder
    );
  }

  /**
   * Request microphone permission and initialize recording
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isVoiceSupported()) {
      this.emitError(
        "permission",
        "Voice recording is not supported in this browser"
      );
      return false;
    }

    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      this.updateState({ hasPermission: true });
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      this.emitError(
        "permission",
        "Microphone permission is required for voice input"
      );
      this.updateState({ hasPermission: false });
      return false;
    }
  }

  /**
   * Start voice recording
   */
  async startRecording(): Promise<void> {
    if (!this.audioStream) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return;
      }
    }

    if (this.stateSubject.value.isRecording) {
      return; // Already recording
    }

    try {
      // Reset recorded chunks
      this.recordedChunks = [];

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream!, {
        mimeType: this.getSupportedMimeType(),
      });

      // Setup event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStopped();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        this.emitError("recording", "Error during recording");
        this.stopRecording();
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms

      // Update state
      this.updateState({
        isRecording: true,
        isListening: true,
        recordingTime: 0,
        animationState: "recording",
      });

      // Start recording timer
      this.startRecordingTimer();

      // Emit start event
      this.recordingStartSubject.next();

      // Auto-stop after max time
      this.recordingTimer = setTimeout(() => {
        this.stopRecording();
      }, this.MAX_RECORDING_TIME);
    } catch (error) {
      console.error("Error starting recording:", error);
      this.emitError("recording", "Failed to start recording");
    }
  }

  /**
   * Stop voice recording
   */
  stopRecording(): void {
    if (!this.stateSubject.value.isRecording || !this.mediaRecorder) {
      return;
    }

    // Clear timers
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    // Stop recording
    this.mediaRecorder.stop();

    // Update state
    this.updateState({
      isRecording: false,
      isListening: false,
      animationState: "processing",
    });

    // Emit stop event
    this.recordingStopSubject.next();
  }

  /**
   * Cancel current recording
   */
  cancelRecording(): void {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.mediaRecorder && this.stateSubject.value.isRecording) {
      this.mediaRecorder.stop();
    }

    // Reset state without processing
    this.updateState({
      isRecording: false,
      isListening: false,
      isProcessing: false,
      recordingTime: 0,
      animationState: "idle",
    });

    // Clear recorded chunks
    this.recordedChunks = [];
  }

  /**
   * Clean up resources and stop recording
   */
  cleanup(): void {
    this.cancelRecording();

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    this.updateState({ hasPermission: false });
  }

  /**
   * Get the current recording state
   */
  getCurrentState(): VoiceRecordingState {
    return this.stateSubject.value;
  }

  /**
   * Handle recording stopped and process audio
   */
  private async handleRecordingStopped(): Promise<void> {
    if (this.recordedChunks.length === 0) {
      this.emitError("recording", "No audio data recorded");
      this.resetState();
      return;
    }

    // Check minimum recording duration (at least 500ms)
    const recordingTime = this.stateSubject.value.recordingTime;
    if (recordingTime < 500) {
      this.emitError(
        "recording",
        "Recording too short. Please speak for at least half a second."
      );
      this.resetState();
      return;
    }

    this.updateState({ isProcessing: true });

    try {
      // Create audio blob
      const audioBlob = new Blob(this.recordedChunks, {
        type: this.getSupportedMimeType(),
      });

      // Send to Whisper API
      const result = await this.transcribeWithWhisper(audioBlob);

      // Emit success
      this.transcriptionSubject.next(result);
      this.updateState({
        animationState: "success",
        isProcessing: false,
      });

      // Reset to idle after a short delay
      setTimeout(() => {
        this.resetState();
      }, 2000);
    } catch (error) {
      console.error("Error processing audio:", error);
      this.emitError("api", "Failed to process audio. Please try again.");
      this.resetState();
    }
  }

  /**
   * Send audio to OpenAI Whisper API for transcription
   */
  private async transcribeWithWhisper(
    audioBlob: Blob
  ): Promise<VoiceTranscriptionResult> {
    const formData = new FormData();

    // Convert blob to file with proper extension
    const audioFile = new File([audioBlob], "audio.webm", {
      type: audioBlob.type,
    });

    formData.append("file", audioFile);
    formData.append("model", "whisper-1");

    // Set language based on current UI language
    const currentLang = this.stateSubject.value.currentLanguage;
    if (currentLang && currentLang !== "auto") {
      formData.append("language", currentLang);
    }

    // Optional: request timestamp granularities for confidence scoring
    formData.append("response_format", "verbose_json");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.openaiApiKey}`,
    });

    try {
      const response = await this.http
        .post<any>(this.WHISPER_API_URL, formData, {
          headers,
        })
        .pipe(timeout(30000), catchError(this.handleApiError.bind(this)))
        .toPromise();

      if (!response || !response.text) {
        throw new Error("No transcription received from API");
      }

      return {
        transcription: response.text.trim(),
        confidence: response.confidence || 0.9, // Whisper doesn't always provide confidence
        language: response.language || currentLang,
        duration:
          response.duration || this.stateSubject.value.recordingTime / 1000,
      };
    } catch (error) {
      console.error("Whisper API error:", error);
      throw error;
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any): Observable<never> {
    let errorType: VoiceError["type"] = "unknown";
    let message = "An unexpected error occurred";

    if (error.status === 401) {
      errorType = "api";
      message = "Authentication failed. Please check your API configuration.";
    } else if (error.status === 429) {
      errorType = "api";
      message = "Too many requests. Please wait a moment and try again.";
    } else if (error.status >= 500) {
      errorType = "api";
      message = "Server error. Please try again later.";
    } else if (error.name === "TimeoutError") {
      errorType = "timeout";
      message = "Request timed out. Please check your internet connection.";
    } else if (!navigator.onLine) {
      errorType = "network";
      message = "No internet connection. Please check your network.";
    }

    return throwError(() => ({
      type: errorType,
      message,
      originalError: error,
    }));
  }

  /**
   * Get supported audio MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "audio/webm"; // fallback
  }

  /**
   * Start recording timer to track duration
   */
  private startRecordingTimer(): void {
    let startTime = Date.now();

    this.recordingInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.updateState({ recordingTime: elapsed });
    }, this.RECORDING_CHECK_INTERVAL);
  }

  /**
   * Update current language from translation service
   */
  private updateCurrentLanguage(): void {
    const uiLang = this.translationService.getCurrentLanguage();

    // Map UI language to Whisper language code
    const whisperLang = this.mapUiLanguageToWhisperLanguage(uiLang);

    this.updateState({ currentLanguage: whisperLang });
  }

  /**
   * Map UI language to Whisper API language code
   */
  private mapUiLanguageToWhisperLanguage(uiLang: string): string {
    const languageMap: { [key: string]: string } = {
      en: "en",
      de: "de",
      es: "es",
      fr: "fr",
      it: "it",
      pt: "pt",
      ru: "ru",
      ja: "ja",
      ko: "ko",
      zh: "zh",
    };

    return languageMap[uiLang] || "en";
  }

  /**
   * Update service state
   */
  private updateState(partialState: Partial<VoiceRecordingState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /**
   * Reset state to idle
   */
  private resetState(): void {
    this.updateState({
      isRecording: false,
      isProcessing: false,
      isListening: false,
      recordingTime: 0,
      animationState: "idle",
    });
  }

  /**
   * Emit error with user-friendly message
   */
  private emitError(type: VoiceError["type"], message: string): void {
    const friendlyMessage = this.getFriendlyErrorMessage(type, message);
    this.errorSubject.next({
      type,
      message,
      friendlyMessage,
    });
    this.updateState({ animationState: "error" });
  }

  /**
   * Get user-friendly error message based on current language
   */
  private getFriendlyErrorMessage(
    type: VoiceError["type"],
    originalMessage: string
  ): string {
    const currentLang = this.translationService.getCurrentLanguage();

    const errorMessages: { [key: string]: { [key: string]: string } } = {
      en: {
        permission:
          "🎤 We need microphone permission to listen to you! Please allow microphone access and try again.",
        recording:
          "😅 Oops! Something went wrong with recording. Let's try again!",
        network:
          "🌐 No internet connection! Please check your network and try again.",
        api: "🤖 Our speech helper is taking a break. Please try again in a moment!",
        timeout:
          "⏰ That took too long! Please check your internet and try again.",
        unknown: "😵 Something unexpected happened. Let's try again!",
      },
      de: {
        permission:
          "🎤 Wir brauchen Mikrofon-Erlaubnis, um dir zuzuhören! Bitte erlaube Mikrofon-Zugang und versuche es nochmal.",
        recording:
          "😅 Ups! Etwas ist beim Aufnehmen schiefgelaufen. Lass es uns nochmal versuchen!",
        network:
          "🌐 Keine Internetverbindung! Bitte überprüfe dein Netzwerk und versuche es nochmal.",
        api: "🤖 Unser Sprach-Helfer macht gerade Pause. Bitte versuche es gleich nochmal!",
        timeout:
          "⏰ Das hat zu lange gedauert! Bitte überprüfe dein Internet und versuche es nochmal.",
        unknown:
          "😵 Etwas Unerwartetes ist passiert. Lass es uns nochmal versuchen!",
      },
    };

    return (
      errorMessages[currentLang]?.[type] ||
      errorMessages["en"][type] ||
      originalMessage
    );
  }
}
