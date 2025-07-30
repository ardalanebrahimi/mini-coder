import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
// Remove HttpClient import to avoid circular dependency with interceptors
// import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

/**
 * Enum defining all possible analytics event types
 */
export enum AnalyticsEventType {
  // Session events
  SESSION_START = "session_start",
  SESSION_END = "session_end",

  // App lifecycle events
  APP_CREATED = "app_created",
  APP_MODIFIED = "app_modified",
  APP_REBUILT = "app_rebuilt",
  APP_PUBLISHED = "app_published",
  APP_SAVED = "app_saved",
  APP_DELETED = "app_deleted",
  APP_PLAYED = "app_played",

  // User interaction events
  TOKEN_SPENT = "token_spent",
  TOKEN_PURCHASED = "token_purchased",
  VOICE_INPUT_USED = "voice_input_used",
  STAR_GIVEN = "star_given",

  // Error events
  API_ERROR = "api_error",
  APP_ERROR = "app_error",

  // UI events
  TOOLBOX_OPENED = "toolbox_opened",
  LANGUAGE_CHANGED = "language_changed",
  AUTH_LOGIN = "auth_login",
  AUTH_LOGOUT = "auth_logout",

  // Preview events
  PREVIEW_GENERATED = "preview_generated",
  PREVIEW_ERROR = "preview_error",
}

/**
 * Interface for analytics event data
 */
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  sessionId: string;
  userId?: string; // Anonymized user ID (not email/username)
  language: string;
  timestamp: string; // ISO string
  details: Record<string, any>; // Event-specific data
}

/**
 * Interface for event details based on event type
 */
export interface EventDetails {
  // App creation/modification
  appCreated?: {
    prompt: string;
    language: string;
    success: boolean;
    errorMessage?: string;
  };

  appModified?: {
    modification: string;
    language: string;
    success: boolean;
    errorMessage?: string;
  };

  appRebuilt?: {
    originalPrompt: string;
    newPrompt: string;
    language: string;
    success: boolean;
  };

  appPublished?: {
    appName: string;
    language: string;
    success: boolean;
  };

  appSaved?: {
    appName: string;
    language: string;
  };

  appDeleted?: {
    appId: string;
    appName: string;
  };

  // Voice events
  voiceInputUsed?: {
    language: string;
    duration: number; // in seconds
    success: boolean;
    errorMessage?: string;
  };

  // Token events
  tokenSpent?: {
    amount: number;
    purpose: string; // 'app_creation', 'app_modification', etc.
    remainingTokens: number;
  };

  tokenPurchased?: {
    amount: number;
    cost: number;
  };

  // Star/rating events
  starGiven?: {
    appId: string;
    rating: number; // 1-5 stars
    appLanguage: string;
  };

  // Error events
  apiError?: {
    endpoint: string;
    statusCode: number;
    errorMessage: string;
  };

  appError?: {
    errorMessage: string;
    stackTrace?: string;
    context: string; // Where the error occurred
  };

  // Session events
  sessionStart?: {
    userAgent: string;
    referrer: string;
    isReturningUser: boolean;
  };

  // UI events
  languageChanged?: {
    fromLanguage: string;
    toLanguage: string;
  };
}

/**
 * Configuration for analytics service
 */
export interface AnalyticsConfig {
  enabled: boolean;
  localStorageKey: string;
  maxLocalEvents: number;
  batchSize: number;
  flushInterval: number; // in milliseconds
  maxRetries: number;
  retryDelay: number; // in milliseconds
  debugMode: boolean;
  backendUrl: string;
  enableDashboard: boolean; // For admin/dev users only
}

/**
 * Analytics Service for tracking user interactions and app events
 *
 * This service provides a comprehensive analytics logging system that:
 * - Tracks user actions throughout the app
 * - Maintains privacy by not logging PII
 * - Stores events locally and can sync to backend
 * - Provides real-time analytics data via observables
 *
 * Usage Examples:
 *
 * 1. Track app creation:
 *    analytics.logEvent(AnalyticsEventType.APP_CREATED, {
 *      appCreated: { prompt: 'Create a calculator', language: 'en', success: true }
 *    });
 *
 * 2. Track voice input:
 *    analytics.logEvent(AnalyticsEventType.VOICE_INPUT_USED, {
 *      voiceInputUsed: { language: 'en', duration: 5.2, success: true }
 *    });
 *
 * 3. Track errors:
 *    analytics.logEvent(AnalyticsEventType.API_ERROR, {
 *      apiError: { endpoint: '/api/generate', statusCode: 500, errorMessage: 'Server error' }
 *    });
 */
@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: true,
    localStorageKey: "minicoder_analytics",
    maxLocalEvents: 50, // Reduced to prevent large payloads
    batchSize: 5, // Much smaller batches to avoid payload size limits
    flushInterval: 15000, // 15 seconds - more frequent to handle smaller batches
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    debugMode: environment.production ? false : true,
    backendUrl: environment.apiUrl || "http://localhost:3000",
    enableDashboard: environment.production ? false : true, // Only in dev
  };

  private sessionId: string;
  private userId?: string;
  private currentLanguage: string = "en";
  private events: AnalyticsEvent[] = [];
  private pendingEvents: AnalyticsEvent[] = []; // Events awaiting backend sync
  private flushTimer?: number;
  private retryTimer?: number;
  private isOnline: boolean = navigator.onLine;

  // Observables for real-time analytics
  private eventsSubject = new BehaviorSubject<AnalyticsEvent[]>([]);
  public events$ = this.eventsSubject.asObservable();

  private statsSubject = new BehaviorSubject<any>({});
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadEventsFromStorage();
    this.startSession();
    this.setupFlushTimer();
    this.setupNetworkListeners();

    // Listen for page unload to flush events
    window.addEventListener("beforeunload", () => {
      this.endSession();
      this.flushEventsSync(); // Synchronous flush on page unload
    });

    if (this.config.debugMode) {
      console.log(
        "🔍 AnalyticsService initialized with session ID:",
        this.sessionId
      );
    }
  }

  /**
   * Set the current user (anonymized ID only)
   */
  setUser(anonymizedUserId: string): void {
    this.userId = anonymizedUserId;
    if (this.config.debugMode) {
      console.log("👤 Analytics user set:", anonymizedUserId);
    }
  }

  /**
   * Set the current language for analytics
   */
  setLanguage(language: string): void {
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = language;

    // Log language change if it's different
    if (previousLanguage !== language) {
      this.logEvent(AnalyticsEventType.LANGUAGE_CHANGED, {
        languageChanged: {
          fromLanguage: previousLanguage,
          toLanguage: language,
        },
      });
    }
  }

  /**
   * Log an analytics event
   */
  logEvent(
    eventType: AnalyticsEventType,
    details: Record<string, any> = {}
  ): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      eventType,
      sessionId: this.sessionId,
      userId: this.userId,
      language: this.currentLanguage,
      timestamp: new Date().toISOString(),
      details,
    };

    // Add to local buffer
    this.events.push(event);

    // Also add to pending events for backend sync
    this.pendingEvents.push(event);

    // Update observables (only for local analytics dashboard if enabled)
    if (this.config.enableDashboard) {
      this.eventsSubject.next([...this.events]);
      this.updateStats();
    }

    // Save to local storage as backup
    this.saveEventsToStorage();

    if (this.config.debugMode) {
      console.log("📊 Analytics event logged:", eventType, details);
    }

    // Auto-flush if we have too many pending events
    if (this.pendingEvents.length >= this.config.batchSize) {
      this.flushEventsToBackend();
    }
  }

  /**
   * Convenience methods for common events
   */

  logAppCreated(
    prompt: string,
    language: string,
    success: boolean,
    errorMessage?: string
  ): void {
    this.logEvent(AnalyticsEventType.APP_CREATED, {
      appCreated: { prompt, language, success, errorMessage },
    });
  }

  logAppModified(
    modification: string,
    language: string,
    success: boolean,
    errorMessage?: string
  ): void {
    this.logEvent(AnalyticsEventType.APP_MODIFIED, {
      appModified: { modification, language, success, errorMessage },
    });
  }

  logAppPublished(appName: string, language: string, success: boolean): void {
    this.logEvent(AnalyticsEventType.APP_PUBLISHED, {
      appPublished: { appName, language, success },
    });
  }

  logVoiceInput(
    language: string,
    duration: number,
    success: boolean,
    errorMessage?: string
  ): void {
    this.logEvent(AnalyticsEventType.VOICE_INPUT_USED, {
      voiceInputUsed: { language, duration, success, errorMessage },
    });
  }

  logTokenSpent(
    amount: number,
    purpose: string,
    remainingTokens: number
  ): void {
    this.logEvent(AnalyticsEventType.TOKEN_SPENT, {
      tokenSpent: { amount, purpose, remainingTokens },
    });
  }

  logApiError(
    endpoint: string,
    statusCode: number,
    errorMessage: string
  ): void {
    // CRITICAL: Prevent infinite loops - do NOT log analytics API errors to analytics
    if (endpoint.includes("/api/analytics/events")) {
      if (this.config.debugMode) {
        console.warn(
          "🚫 Skipping analytics API error logging to prevent infinite loop:",
          {
            endpoint,
            statusCode,
            errorMessage,
          }
        );
      }
      return;
    }

    this.logEvent(AnalyticsEventType.API_ERROR, {
      apiError: { endpoint, statusCode, errorMessage },
    });
  }

  logAppError(
    errorMessage: string,
    context: string,
    stackTrace?: string
  ): void {
    this.logEvent(AnalyticsEventType.APP_ERROR, {
      appError: { errorMessage, context, stackTrace },
    });
  }

  /**
   * Manual API error logging method
   * Call this from services when HTTP requests fail to replace interceptor functionality
   */
  logHttpError(
    error: any,
    endpoint: string,
    context: string = "http_request"
  ): void {
    const statusCode = error?.status || 0;
    const errorMessage =
      error?.message || error?.statusText || "Unknown HTTP error";

    this.logApiError(endpoint, statusCode, errorMessage);

    if (this.config.debugMode) {
      console.log(
        `📡 HTTP Error logged: ${endpoint} - ${statusCode} - ${errorMessage}`
      );
    }
  }

  /**
   * Get analytics statistics (only if dashboard is enabled)
   */
  getStats(): any {
    if (!this.config.enableDashboard) {
      return {
        dashboardDisabled: true,
        message: "Analytics dashboard is disabled in production",
      };
    }

    const stats = {
      totalEvents: this.events.length,
      pendingSync: this.pendingEvents.length,
      sessionDuration: Date.now() - new Date(this.sessionId).getTime(),
      isOnline: this.isOnline,
      eventCounts: {} as Record<string, number>,
      languageDistribution: {} as Record<string, number>,
      errorCount: 0,
    };

    // Count events by type
    this.events.forEach((event) => {
      stats.eventCounts[event.eventType] =
        (stats.eventCounts[event.eventType] || 0) + 1;
      stats.languageDistribution[event.language] =
        (stats.languageDistribution[event.language] || 0) + 1;

      if (event.eventType.includes("error")) {
        stats.errorCount++;
      }
    });

    return stats;
  }

  /**
   * Check if dashboard is enabled (dev/admin only)
   */
  isDashboardEnabled(): boolean {
    return this.config.enableDashboard;
  }

  /**
   * Clear all analytics data (for privacy/reset)
   */
  clearAnalytics(): void {
    this.events = [];
    this.pendingEvents = [];
    localStorage.removeItem(this.config.localStorageKey);

    if (this.config.enableDashboard) {
      this.eventsSubject.next([]);
      this.updateStats();
    }

    if (this.config.debugMode) {
      console.log("🗑️ Analytics data cleared");
    }
  }

  /**
   * Export analytics data (for debugging or manual analysis)
   */
  exportData(): string {
    if (!this.config.enableDashboard) {
      return JSON.stringify({
        error: "Data export disabled in production",
        dashboardEnabled: false,
      });
    }

    return JSON.stringify(
      {
        sessionId: this.sessionId,
        events: this.events,
        pendingEvents: this.pendingEvents.length,
        stats: this.getStats(),
        isOnline: this.isOnline,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Private methods
   */

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startSession(): void {
    const isReturning = !!localStorage.getItem(this.config.localStorageKey);

    this.logEvent(AnalyticsEventType.SESSION_START, {
      sessionStart: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        isReturningUser: isReturning,
      },
    });
  }

  private endSession(): void {
    this.logEvent(AnalyticsEventType.SESSION_END, {});
  }

  private loadEventsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.events = data.events || [];
        this.pendingEvents = data.pendingEvents || [];

        // Limit stored events to prevent storage bloat
        if (this.events.length > this.config.maxLocalEvents) {
          this.events = this.events.slice(-this.config.maxLocalEvents);
        }

        if (this.config.enableDashboard) {
          this.eventsSubject.next([...this.events]);
          this.updateStats();
        }
      }
    } catch (error) {
      console.warn("Failed to load analytics from storage:", error);
      this.events = [];
      this.pendingEvents = [];
    }
  }

  private saveEventsToStorage(): void {
    try {
      const data = {
        sessionId: this.sessionId,
        events: this.events.slice(-this.config.maxLocalEvents), // Keep only recent events
        pendingEvents: this.pendingEvents,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save analytics to storage:", error);
    }
  }

  private setupFlushTimer(): void {
    if (this.flushTimer) {
      window.clearInterval(this.flushTimer);
    }

    this.flushTimer = window.setInterval(() => {
      this.flushEventsToBackend();
    }, this.config.flushInterval);
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      if (this.config.debugMode) {
        console.log("📶 Back online - attempting to sync pending events");
      }
      // Retry pending events when back online
      this.flushEventsToBackend();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      if (this.config.debugMode) {
        console.log("📵 Gone offline - events will be buffered");
      }
    });
  }

  private async flushEventsToBackend(): Promise<void> {
    if (this.pendingEvents.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSync = [...this.pendingEvents]; // Copy events
    const url = `${this.config.backendUrl}/api/analytics/events`;

    // Check payload size and split if too large
    const payload = JSON.stringify({ events: eventsToSync });
    const payloadSizeMB = new Blob([payload]).size / (1024 * 1024);

    if (payloadSizeMB > 5) {
      // If payload > 5MB, split it
      console.warn(
        `Analytics payload too large (${payloadSizeMB.toFixed(
          2
        )}MB), splitting...`
      );
      await this.flushEventsInChunks(eventsToSync);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      // Clear synced events from pending queue
      this.pendingEvents = [];
      this.saveEventsToStorage();

      if (this.config.debugMode) {
        console.log(
          `✅ Synced ${
            eventsToSync.length
          } analytics events to backend (${payloadSizeMB.toFixed(2)}MB)`,
          result
        );
      }
    } catch (error: any) {
      // CRITICAL: Do NOT log analytics API errors to prevent infinite loops
      console.warn("Failed to sync analytics to backend:", error);

      // If payload too large error, try to split into smaller chunks
      if (
        error.message.includes("request entity too large") ||
        error.message.includes("PayloadTooLargeError")
      ) {
        console.warn("Payload too large, splitting into smaller chunks...");
        await this.flushEventsInChunks(eventsToSync);
        return;
      }

      // Implement retry logic for other errors
      this.scheduleRetry();

      // Log the sync error locally for debugging (but do NOT send to analytics)
      if (this.config.debugMode) {
        console.log("❌ Analytics sync failed, will retry:", error.message);
      }
    }
  }

  /**
   * Split large payloads into smaller chunks and send them individually
   */
  private async flushEventsInChunks(events: AnalyticsEvent[]): Promise<void> {
    const chunkSize = Math.max(1, Math.floor(this.config.batchSize / 2)); // Half the normal batch size
    const chunks = [];

    for (let i = 0; i < events.length; i += chunkSize) {
      chunks.push(events.slice(i, i + chunkSize));
    }

    let successfulChunks = 0;
    const url = `${this.config.backendUrl}/api/analytics/events`;

    for (const chunk of chunks) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ events: chunk }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        successfulChunks++;

        if (this.config.debugMode) {
          console.log(
            `✅ Synced chunk ${successfulChunks}/${chunks.length} (${chunk.length} events)`
          );
        }

        // Small delay between chunks to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(
          `Failed to sync chunk ${successfulChunks + 1}/${chunks.length}:`,
          error
        );
        // Continue with other chunks even if one fails
      }
    }

    // Only clear events that were successfully sent
    if (successfulChunks > 0) {
      const successfulEvents = successfulChunks * chunkSize;
      this.pendingEvents = this.pendingEvents.slice(successfulEvents);
      this.saveEventsToStorage();

      if (this.config.debugMode) {
        console.log(
          `📊 Successfully synced ${successfulEvents}/${events.length} events in ${successfulChunks} chunks`
        );
      }
    }
  }

  private flushEventsSync(): void {
    // Synchronous version for page unload (using navigator.sendBeacon if available)
    if (this.pendingEvents.length === 0 || !this.isOnline) {
      return;
    }

    const url = `${this.config.backendUrl}/api/analytics/events`;
    const data = JSON.stringify({ events: this.pendingEvents });

    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(url, blob);

      if (this.config.debugMode) {
        console.log(`📡 Sent ${this.pendingEvents.length} events via beacon`);
      }
    } else {
      // Fallback to synchronous XMLHttpRequest
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, false); // Synchronous
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
      } catch (error) {
        console.warn("Failed to send analytics on page unload:", error);
      }
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      window.clearTimeout(this.retryTimer);
    }

    this.retryTimer = window.setTimeout(() => {
      if (this.isOnline && this.pendingEvents.length > 0) {
        this.flushEventsToBackend();
      }
    }, this.config.retryDelay);
  }

  private updateStats(): void {
    if (this.config.enableDashboard) {
      this.statsSubject.next(this.getStats());
    }
  }
}

/**
 * Helper function to create anonymized user ID from actual user data
 * This ensures we don't store any PII while still being able to track user sessions
 */
export function createAnonymizedUserId(userEmail: string): string {
  // Create a hash-like string without exposing the actual email
  let hash = 0;
  for (let i = 0; i < userEmail.length; i++) {
    const char = userEmail.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `user_${Math.abs(hash).toString(36)}`;
}
