import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import {
  PreviewSectionService,
  PreviewData,
} from "../services/preview-section.service";
import { TranslationService } from "../services/translation.service";
import { AppStoreService } from "../services/app-store.service";
import { AuthService } from "../services/auth.service";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "../services/analytics.service";
import { AppPopupService } from "../services/app-popup.service";

@Component({
  selector: "app-preview-section",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./preview-section.component.html",
  styleUrls: ["./preview-section.component.scss"],
})
export class PreviewSectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() showAuthModalEvent = new EventEmitter<string>();
  @Input() isPopupMode = false; // Whether component is used in popup mode
  @Input() showToolboxActions = true; // Whether to show save/modify actions

  previewData: PreviewData = {
    currentApp: null,
    previewHtml: "",
    previewUrl: "",
    safePreviewUrl: null,
    userCommand: "",
  };

  constructor(
    private previewSectionService: PreviewSectionService,
    private translationService: TranslationService,
    private appStoreService: AppStoreService,
    private authService: AuthService,
    private analytics: AnalyticsService,
    private appPopupService: AppPopupService
  ) {}

  ngOnInit(): void {
    // Subscribe to preview data changes
    this.previewSectionService.previewData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.previewData = data;
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
   * Check if current app is read-only (from App Store)
   */
  get isReadOnly(): boolean {
    return this.previewData.currentApp?.isReadOnly === true;
  }

  /**
   * Handle modify button click
   */
  onModifyClick(): void {
    const isLoggedIn = this.authService.isLoggedIn();

    // Log modify app attempt with new analytics event
    this.analytics.logEvent(AnalyticsEventType.APP_MODIFY_ATTEMPTED, {
      appModifyAttempted: {
        currentAppName: this.previewData.currentApp?.projectName,
        language: this.previewData.currentApp?.detectedLanguage || "unknown",
        userType: isLoggedIn ? "logged_in" : "guest",
        loginPromptShown: !isLoggedIn,
        buttonLabel: this.t("modifyApp"), // This will now be "Make it better"
      },
    });

    this.previewSectionService.emitAction("modify");
  }

  /**
   * Handle save to toolbox button click
   */
  onSaveToToolboxClick(): void {
    // Log attempt to save app to toolbox
    this.analytics.logEvent(AnalyticsEventType.APP_MODIFY_ATTEMPTED, {
      appModifyAttempted: {
        buttonLabel: "Save to Toolbox",
        userType: this.authService.isLoggedIn() ? "logged-in" : "guest",
        loginPromptShown: !this.authService.isLoggedIn(),
        timestamp: new Date().toISOString(),
      },
    });

    this.previewSectionService.emitAction("saveToToolbox");
  }

  /**
   * Handle add to app store button click
   */
  onAddToAppStoreClick(): void {
    // Log attempt to publish to app store
    this.analytics.logEvent(AnalyticsEventType.APP_MODIFY_ATTEMPTED, {
      appModifyAttempted: {
        buttonLabel: "Add to App Store",
        userType: this.authService.isLoggedIn() ? "logged-in" : "guest",
        loginPromptShown: !this.authService.isLoggedIn(),
        timestamp: new Date().toISOString(),
      },
    });

    this.previewSectionService.emitAction("addToAppStore");
  }

  /**
   * Handle clear button click
   */
  onClearClick(): void {
    this.previewSectionService.emitAction("clear");
  }

  /**
   * Open app in popup mode
   */
  onOpenInPopup(): void {
    if (this.previewData.currentApp) {
      this.appPopupService.openUserApp(
        this.previewData.currentApp,
        this.previewData.currentApp.projectName || "Your App"
      );
    }
  }

  /**
   * Check if current preview is from app store (has source project)
   */
  isAppStorePreview(): boolean {
    return !!this.previewData.sourceProject;
  }

  /**
   * Handle star button click for app store preview
   */
  onStarProject(): void {
    if (!this.previewData.sourceProject) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      // Log guest user trying to star an app
      this.analytics.logLoginPromptShown("star_app_store_project");
      // Show auth modal if not logged in
      this.showAuthModal();
      return;
    }

    // Toggle star status
    this.appStoreService
      .toggleStar(this.previewData.sourceProject.id)
      .subscribe({
        next: (response) => {
          if (this.previewData.sourceProject) {
            // Update the project's star information
            this.previewData.sourceProject.starred = response.starred;
            this.previewData.sourceProject.starCount = response.starCount;
          }
        },
        error: (error) => {
          console.error("Error toggling star:", error);
        },
      });
  }

  /**
   * Show authentication modal
   */
  private showAuthModal(): void {
    this.showAuthModalEvent.emit(
      "Please log in or register to star apps from the App Store."
    );
  }

  /**
   * Handle iframe load event
   */
  onIframeLoad(event: any): void {
    const iframe = event.target;
    try {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
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
    // Emit error through service if needed
    // this.previewSectionService.emitError("Failed to load app preview. Check console for details.");
  }
}
