import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
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
    private analytics: AnalyticsService
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
    this.previewSectionService.emitAction("modify");
  }

  /**
   * Handle save button click
   */
  onSaveClick(): void {
    // Log attempt to save app to toolbox
    if (!this.authService.isLoggedIn()) {
      // Log guest user trying to save to toolbox
      this.analytics.logLoginPromptShown("save_to_toolbox");
    }
    this.previewSectionService.emitAction("save");
  }

  /**
   * Handle clear button click
   */
  onClearClick(): void {
    this.previewSectionService.emitAction("clear");
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
