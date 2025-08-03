import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section">
      <!-- Floating elements -->
      <div class="floating-element top-left">
        <div class="floating-icon">✨</div>
      </div>
      <div class="floating-element top-right">
        <div class="floating-icon">🚀</div>
      </div>
      <div class="floating-element bottom-left">
        <div class="floating-icon">⚡</div>
      </div>

      <div class="container hero-content">
        <div class="hero-wrapper">
          <!-- Logo/Brand -->
          <div class="brand-section">
            <div class="brand-icon rocket">🚀</div>
            <h1 class="brand-title">Mini Coder</h1>
            <div class="brand-icon sparkles">✨</div>
          </div>

          <!-- Headline -->
          <h2 class="headline">
            {{ t("landing.hero.headline") }}
          </h2>

          <!-- Subheading -->
          <p class="subheading">
            {{ t("landing.hero.subheading") }}
          </p>

          <!-- CTA Buttons -->
          <div class="cta-buttons">
            <button class="btn btn-hero btn-xl" (click)="onTryItFree()">
              <span class="button-icon">🚀</span>
              {{ t("landing.hero.tryItFree") }}
            </button>
            <button
              class="btn btn-outline btn-xl"
              (click)="onBrowseCommunity()"
            >
              {{ t("landing.hero.browseCommunity") }}
            </button>
          </div>

          <!-- Trust indicators -->
          <div class="trust-indicators" *ngIf="false">
            <p>
              ✨ Safe & Privacy-First • 🎮 10,000+ Games Created • 👪
              Parent-Approved
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./hero.component.scss"],
})
export class HeroComponent {
  @Output() tryItFree = new EventEmitter<void>();
  @Output() browseCommunity = new EventEmitter<void>();

  constructor(private translationService: TranslationService) {}

  /**
   * Translation helper method
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  onTryItFree(): void {
    this.tryItFree.emit();
  }

  onBrowseCommunity(): void {
    this.browseCommunity.emit();
  }
}
