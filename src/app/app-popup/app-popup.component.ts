import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { PreviewSectionComponent } from "../preview-section/preview-section.component";
import { AppPopupService, AppPopupData } from "../services/app-popup.service";
import {
  PreviewSectionService,
  PreviewData,
} from "../services/preview-section.service";
import { AppStoreService } from "../services/app-store.service";
import { TranslationService } from "../services/translation.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-app-popup",
  standalone: true,
  imports: [CommonModule, PreviewSectionComponent],
  template: `
    <!-- Popup Overlay -->
    <div
      class="popup-overlay"
      *ngIf="popupData.isOpen"
      [class.fullscreen]="popupData.isFullscreen"
      (click)="onOverlayClick($event)"
    >
      <div
        class="popup-container"
        [class.fullscreen]="popupData.isFullscreen"
        (click)="$event.stopPropagation()"
      >
        <!-- Popup Header -->
        <div class="popup-header">
          <div class="popup-title">
            <span class="emoji">📱</span>
            <h3>{{ popupData.title || "App Preview" }}</h3>
            <span class="read-only-badge" *ngIf="!popupData.showToolboxActions">
              {{ t("readOnly") }}
            </span>
          </div>
          <div class="popup-controls">
            <button
              class="control-btn fullscreen-btn"
              (click)="toggleFullscreen()"
              [title]="
                popupData.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
              "
            >
              <span class="emoji">{{
                popupData.isFullscreen ? "🗗" : "🗖"
              }}</span>
            </button>
            <button
              class="control-btn close-btn"
              (click)="closePopup()"
              title="Close"
            >
              <span class="emoji">✕</span>
            </button>
          </div>
        </div>

        <!-- App Preview (using existing preview section logic) -->
        <div class="popup-content">
          <app-preview-section
            *ngIf="isPreviewReady"
            [isPopupMode]="true"
            [showToolboxActions]="popupData.showToolboxActions || false"
            (showAuthModalEvent)="onShowAuthModal($event)"
          ></app-preview-section>

          <!-- Loading state for when app is being loaded -->
          <div class="loading-state" *ngIf="isLoading">
            <div class="loading-content">
              <div class="loading-spinner"></div>
              <p>Loading app...</p>
            </div>
          </div>

          <!-- Error state -->
          <div class="error-state" *ngIf="error">
            <span class="emoji">❌</span>
            <p>{{ error }}</p>
            <button class="retry-btn" (click)="retryLoading()">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./app-popup.component.scss"],
})
export class AppPopupComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() showAuthModalEvent = new EventEmitter<string>();

  popupData: AppPopupData = { isOpen: false };
  isPreviewReady = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private appPopupService: AppPopupService,
    private previewSectionService: PreviewSectionService,
    private appStoreService: AppStoreService,
    private translationService: TranslationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Subscribe to popup data changes
    this.appPopupService.popupData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.popupData = data;
        if (data.isOpen) {
          this.handlePopupOpen();
        } else {
          this.handlePopupClose();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle popup opening
   */
  private handlePopupOpen(): void {
    this.isLoading = true;
    this.error = null;
    this.isPreviewReady = false;

    // If we have a currentApp already, use it
    if (this.popupData.currentApp) {
      this.setupPreviewFromApp(this.popupData.currentApp);
      return;
    }

    // If we have an appId, load the app data
    if (this.popupData.appId && this.popupData.sourceProject) {
      this.loadAppStoreProject();
    } else if (this.popupData.appId) {
      this.loadSampleApp();
    } else {
      this.error = "No app data available";
      this.isLoading = false;
    }
  }

  /**
   * Handle popup closing
   */
  private handlePopupClose(): void {
    this.isPreviewReady = false;
    this.previewSectionService.clearPreviewData();
  }

  /**
   * Load app store project data
   */
  private loadAppStoreProject(): void {
    if (!this.popupData.sourceProject || !this.popupData.appId) {
      this.error = "Invalid project data";
      this.isLoading = false;
      return;
    }

    this.appStoreService
      .getPublicProject(Number(this.popupData.appId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          if (project.code) {
            // Create a ProcessedCommand-like object
            const processedApp = {
              userCommand: `Try: ${project.name}`,
              detectedLanguage: project.language,
              generatedCode: project.code,
              projectName: project.name,
              isReadOnly: true,
            };
            this.setupPreviewFromApp(processedApp, project);
          } else {
            this.error = "App code not available";
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error("Error loading project:", error);
          this.error = "Failed to load app";
          this.isLoading = false;
        },
      });
  }

  /**
   * Load sample app (placeholder for now)
   */
  private loadSampleApp(): void {
    // For now, just show an error - this would need to be implemented
    // based on how sample apps are stored/served
    this.error = "Sample apps not yet implemented";
    this.isLoading = false;
  }

  /**
   * Setup preview from app data
   */
  private setupPreviewFromApp(app: any, sourceProject?: any): void {
    try {
      // Create blob URL for the HTML content
      const blob = new Blob([app.generatedCode], { type: "text/html" });
      const previewUrl = URL.createObjectURL(blob);
      const safePreviewUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);

      // Setup preview data
      const previewData: PreviewData = {
        currentApp: app,
        previewHtml: app.generatedCode,
        previewUrl,
        safePreviewUrl,
        userCommand: app.userCommand,
        sourceProject,
      };

      this.previewSectionService.updatePreviewData(previewData);
      this.isPreviewReady = true;
      this.isLoading = false;
    } catch (error) {
      console.error("Error setting up preview:", error);
      this.error = "Failed to setup app preview";
      this.isLoading = false;
    }
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    this.appPopupService.toggleFullscreen();
  }

  /**
   * Close popup
   */
  closePopup(): void {
    this.appPopupService.closePopup();
  }

  /**
   * Handle overlay click (close on click outside)
   */
  onOverlayClick(event: Event): void {
    // Only close if clicking the overlay itself, not the content
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  /**
   * Handle escape key
   */
  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.popupData.isOpen) {
      this.closePopup();
    }
  }

  /**
   * Handle fullscreen toggle key (F11)
   */
  @HostListener("document:keydown.f11", ["$event"])
  onF11Key(event: KeyboardEvent): void {
    if (this.popupData.isOpen) {
      event.preventDefault();
      this.toggleFullscreen();
    }
  }

  /**
   * Get translation
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  /**
   * Handle auth modal request from preview section
   */
  onShowAuthModal(message: string): void {
    this.showAuthModalEvent.emit(message);
  }

  /**
   * Retry loading the app
   */
  retryLoading(): void {
    this.handlePopupOpen();
  }
}
