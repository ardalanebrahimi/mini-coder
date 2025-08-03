import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: "app-features",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t("landing.features.title") }}</h2>
          <p class="section-subtitle">
            {{ t("landing.features.subtitle") }}
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" *ngFor="let feature of features">
            <div class="feature-icon-wrapper" [ngClass]="feature.colorClass">
              <span class="feature-emoji">{{ feature.icon }}</span>
            </div>

            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./features.component.scss"],
})
export class FeaturesComponent {
  constructor(private translationService: TranslationService) {}

  /**
   * Translation helper method
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  get features() {
    return [
      {
        icon: "⚡",
        title: this.t("landing.features.aiPowered"),
        description: this.t("landing.features.aiPoweredDesc"),
        colorClass: "bg-yellow",
      },
      {
        icon: "🛡️",
        title: this.t("landing.features.safeSecure"),
        description: this.t("landing.features.safeSecureDesc"),
        colorClass: "bg-green",
      },
      {
        icon: "🚫",
        title: this.t("landing.features.noCode"),
        description: this.t("landing.features.noCodeDesc"),
        colorClass: "bg-pink",
      },
      {
        icon: "�",
        title: this.t("landing.features.instantShare"),
        description: this.t("landing.features.instantShareDesc"),
        colorClass: "bg-blue",
      },
      {
        icon: "♾️",
        title: this.t("landing.features.unlimitedCreation"),
        description: this.t("landing.features.unlimitedCreationDesc"),
        colorClass: "bg-purple",
      },
      {
        icon: "💻",
        title: this.t("landing.features.realCode"),
        description: this.t("landing.features.realCodeDesc"),
        colorClass: "bg-orange",
      },
    ];
  }
}
