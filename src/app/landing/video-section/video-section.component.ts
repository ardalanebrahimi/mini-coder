import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-video-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="video-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">See MiniCoder in Action</h2>
          <p class="section-subtitle">
            Watch how kids create amazing games in just minutes with our
            AI-powered platform
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
                <span class="play-text">Watch Demo</span>
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
            <span class="feature-text">Real kids, real creations</span>
          </div>
          <div class="feature-item">
            <span class="feature-emoji">⚡</span>
            <span class="feature-text">No coding required</span>
          </div>
          <div class="feature-item">
            <span class="feature-emoji">🎉</span>
            <span class="feature-text">Instant results</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./video-section.component.scss"],
})
export class VideoSectionComponent {
  showPlayOverlay = false; // Set to true if you want a custom play button
  safeVideoUrl: SafeResourceUrl;

  // YouTube video URL with maximum branding removal
  private videoUrl =
    "https://www.youtube.com/embed/rFaQmeCv50A?autoplay=1&mute=1&loop=1&playlist=rFaQmeCv50A&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&start=0&fs=0&disablekb=1&cc_load_policy=0&color=white&theme=light";

  // Alternative with minimal controls (if you want users to be able to play/pause)
  // private videoUrl = "https://www.youtube.com/embed/rFaQmeCv50A?autoplay=1&mute=1&loop=1&playlist=rFaQmeCv50A&controls=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&start=0&fs=0&disablekb=1&cc_load_policy=0&color=white&theme=light";

  constructor(private sanitizer: DomSanitizer) {
    // Sanitize the YouTube URL for security
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videoUrl
    );
  }

  onVideoClick(): void {
    // Hide the overlay when clicked
    this.showPlayOverlay = false;
  }
}
