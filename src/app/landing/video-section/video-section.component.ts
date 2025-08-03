import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { TranslationService } from "../../services/translation.service";
import { AnalyticsService } from "../../services/analytics.service";

@Component({
  selector: "app-video-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="video-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t("landing.video.title") }}</h2>
          <p class="section-subtitle">
            {{ t("landing.video.subtitle") }}
          </p>
        </div>

        <div class="video-container">
          <div class="video-wrapper">
            <iframe
              [src]="safeVideoUrl"
              title="MiniCoder Demo Video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="video-iframe"
              (click)="onVideoIframeClick()"
            ></iframe>

            <!-- Custom branded overlay to minimize YouTube branding -->
            <div class="brand-overlay">
              <div class="mini-logo">🚀 Demo</div>
            </div>

            <!-- Optional: Custom play button overlay for better UX -->
            <div
              class="custom-play-overlay"
              *ngIf="showPlayOverlay"
              (click)="onVideoClick()"
            >
              <div class="play-button">
                <span class="play-icon">▶️</span>
                <span class="play-text">{{ t("landing.video.playText") }}</span>
              </div>
            </div>
          </div>

          <!-- Optional: Add decorative elements -->
          <div class="video-decoration">
            <div class="floating-emoji top-left">✨</div>
            <div class="floating-emoji top-right">🎮</div>
            <div class="floating-emoji bottom-left">🚀</div>
            <div class="floating-emoji bottom-right">🎨</div>
          </div>
        </div>

        <div class="video-features">
          <div class="feature-item">
            <span class="feature-emoji">🎯</span>
            <span class="feature-text">{{ t("landing.video.feature1") }}</span>
          </div>
          <div class="feature-item">
            <span class="feature-emoji">⚡</span>
            <span class="feature-text">{{ t("landing.video.feature2") }}</span>
          </div>
          <div class="feature-item">
            <span class="feature-emoji">🎉</span>
            <span class="feature-text">{{ t("landing.video.feature3") }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./video-section.component.scss"],
})
export class VideoSectionComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  showPlayOverlay = false; // Set to true if you want a custom play button
  safeVideoUrl: SafeResourceUrl;

  // YouTube video URL with maximum branding removal
  private videoUrl =
    "https://www.youtube.com/embed/rFaQmeCv50A?autoplay=1&mute=1&loop=1&playlist=rFaQmeCv50A&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&start=0&fs=0&disablekb=1&cc_load_policy=0&color=white&theme=light";

  constructor(
    private sanitizer: DomSanitizer,
    private translationService: TranslationService,
    private analytics: AnalyticsService
  ) {
    // Sanitize the YouTube URL for security
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videoUrl
    );
  }

  ngOnInit() {
    this.subscription.add(
      this.translationService.selectedLanguage$.subscribe(() => {
        // Component will automatically update when language changes
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  onVideoClick(): void {
    // Log video play event
    this.analytics.logVideoPlayed("minicoder_demo_video", "video_section");
    
    // Hide the overlay when clicked
    this.showPlayOverlay = false;
  }

  onVideoIframeClick(): void {
    // Log video interaction
    this.analytics.logVideoPlayed("minicoder_demo_video", "video_section");
  }
}
