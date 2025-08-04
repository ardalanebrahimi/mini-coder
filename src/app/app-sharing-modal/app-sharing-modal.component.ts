import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
  AppSharingService,
  AppSharingData,
} from "../services/app-sharing.service";
import { TranslationService } from "../services/translation.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: "app-app-sharing-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Sharing Modal Overlay -->
    <div
      class="sharing-overlay"
      *ngIf="sharingData.isOpen"
      (click)="onOverlayClick($event)"
    >
      <div class="sharing-modal" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="sharing-header">
          <div class="sharing-title">
            <span class="emoji">🚀</span>
            <h3>{{ t("sharing.title") || "Share Your App" }}</h3>
          </div>
          <button class="close-btn" (click)="closeSharingModal()" title="Close">
            <span class="emoji">✕</span>
          </button>
        </div>

        <!-- Loading State -->
        <div class="sharing-content" *ngIf="sharingData.isGenerating">
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>
              {{
                t("sharing.generating") || "Generating your shareable app..."
              }}
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div class="sharing-content" *ngIf="sharingData.error">
          <div class="error-state">
            <span class="emoji">❌</span>
            <p>{{ sharingData.error }}</p>
            <button class="retry-btn" (click)="retryGeneration()">
              {{ t("common.tryAgain") || "Try Again" }}
            </button>
          </div>
        </div>

        <!-- Share Content -->
        <div
          class="sharing-content"
          *ngIf="
            sharingData.shareableApp &&
            !sharingData.isGenerating &&
            !sharingData.error
          "
        >
          <!-- App Info -->
          <div class="app-info-section">
            <h4>
              {{ t("sharing.appReady") || "Your app is ready to share!" }}
            </h4>
            <div class="app-summary">
              <div class="app-detail">
                <span class="emoji">📱</span>
                <div>
                  <strong>{{ sharingData.shareableApp.appName }}</strong>
                  <p>by {{ sharingData.shareableApp.creatorUsername }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Share Options -->
          <div class="share-options">
            <!-- Custom Share Text -->
            <div class="share-option">
              <div class="share-option-header">
                <span class="emoji">📝</span>
                <span class="share-option-title">{{
                  t("sharing.customText") || "Share Message"
                }}</span>
              </div>
              <textarea
                [(ngModel)]="customShareText"
                class="share-text-input"
                rows="3"
                [placeholder]="
                  t('sharing.textPlaceholder') ||
                  'Customize your share message...'
                "
              ></textarea>
            </div>

            <!-- Share Link -->
            <div class="share-option">
              <div class="share-option-header">
                <span class="emoji">🔗</span>
                <span class="share-option-title">{{
                  t("sharing.shareLink") || "Share Link"
                }}</span>
              </div>
              <div class="share-link-container">
                <input
                  type="text"
                  [value]="sharingData.shareUrl"
                  readonly
                  class="share-link-input"
                  #shareUrlInput
                />
                <button
                  class="copy-btn"
                  (click)="copyShareUrl(shareUrlInput.value)"
                  [class.copied]="copySuccess"
                >
                  <span class="emoji">{{ copySuccess ? "✅" : "📋" }}</span>
                  {{
                    copySuccess
                      ? t("sharing.copied") || "Copied!"
                      : t("sharing.copy") || "Copy"
                  }}
                </button>
              </div>
            </div>

            <!-- Native Device Sharing -->
            <div class="share-option" *ngIf="canUseNativeShare">
              <div class="share-option-header">
                <span class="emoji">📱</span>
                <span class="share-option-title">{{
                  t("sharing.deviceShare") || "Share via Device"
                }}</span>
              </div>
              <button class="device-share-btn" (click)="shareViaDevice()">
                <span class="emoji">🔄</span>
                {{ t("sharing.shareButton") || "Share App" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./app-sharing-modal.component.scss"],
})
export class AppSharingModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() closeSharingEvent = new EventEmitter<void>();

  sharingData: AppSharingData = {
    isOpen: false,
  };

  copySuccess = false;
  customShareText = "";
  canUseNativeShare = false;

  constructor(
    private appSharingService: AppSharingService,
    private translationService: TranslationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Check if native sharing is supported
    this.canUseNativeShare = !!navigator.share;

    // Subscribe to sharing data changes
    this.appSharingService.sharingData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.sharingData = data;
        // Initialize custom share text when shareableApp is available
        if (data.shareableApp && !this.customShareText) {
          this.customShareText =
            data.shareableApp.shareText ||
            `Check out "${data.shareableApp.appName}" created with MiniCoder! 🚀`;
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
   * Handle overlay click to close modal
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeSharingModal();
    }
  }

  /**
   * Handle escape key to close modal
   */
  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.sharingData.isOpen) {
      this.closeSharingModal();
    }
  }

  /**
   * Close sharing modal
   */
  closeSharingModal(): void {
    this.appSharingService.closeSharingModal();
    this.copySuccess = false;
    this.customShareText = "";
    this.closeSharingEvent.emit();
  }

  /**
   * Retry generation if there was an error
   */
  retryGeneration(): void {
    if (this.sharingData.currentApp) {
      this.appSharingService.openSharingModal(this.sharingData.currentApp);
    }
  }

  /**
   * Copy share URL to clipboard
   */
  async copyShareUrl(url: string): Promise<void> {
    try {
      const success = await this.appSharingService.copyToClipboard(url);
      if (success) {
        this.copySuccess = true;
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  }

  /**
   * Share via device's native sharing
   */
  shareViaDevice = async () => {
    if (!this.sharingData.shareableApp || !navigator.share) {
      return;
    }

    try {
      // Combine custom text with URL for a complete share message
      const shareText = `${this.customShareText}\n\n${this.sharingData.shareableApp.shareUrl}`;

      await navigator.share({
        title: this.sharingData.shareableApp.appName,
        text: shareText,
      });
    } catch (error) {
      // User cancelled or sharing failed
      console.log("Native sharing cancelled or failed:", error);
    }
  };
}
