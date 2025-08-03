import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: "app-safety-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="safety-section">
      <div class="container">
        <div class="section-header">
          <div class="trust-badge">
            <span class="shield-icon">🛡️</span>
            <span class="trust-text">{{ t("landing.safety.trustBadge") }}</span>
          </div>
          <h2 class="section-title">{{ t("landing.safety.mainTitle") }}</h2>
          <p class="section-subtitle">
            {{ t("landing.safety.mainSubtitle") }}
          </p>
        </div>

        <div class="safety-grid">
          <div class="safety-card" *ngFor="let feature of safetyFeatures">
            <div class="card-icon" [ngClass]="feature.colorClass">
              <span class="feature-emoji">{{ feature.icon }}</span>
            </div>
            <h3 class="card-title">{{ t(feature.titleKey) }}</h3>
            <p class="card-description">{{ t(feature.descriptionKey) }}</p>
          </div>
        </div>

        <div class="compliance-section">
          <h3 class="compliance-title">
            {{ t("landing.safety.complianceTitle") }}
          </h3>
          <p class="compliance-text">
            {{ t("landing.safety.complianceText") }}
          </p>
          <div class="compliance-badges">
            <span class="badge coppa">{{
              t("landing.safety.badgeCoppa")
            }}</span>
            <span class="badge gdpr">{{ t("landing.safety.badgeGdpr") }}</span>
            <span class="badge moderated">{{
              t("landing.safety.badgeModerated")
            }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./safety-section.component.scss"],
})
export class SafetySectionComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(private translationService: TranslationService) {}

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

  get safetyFeatures() {
    return [
      {
        icon: "🔒",
        titleKey: "landing.safety.privacyFirstTitle",
        descriptionKey: "landing.safety.privacyFirstDesc",
        colorClass: "green-icon",
      },
      {
        icon: "🛡️",
        titleKey: "landing.safety.secureTitle",
        descriptionKey: "landing.safety.secureDesc2",
        colorClass: "blue-icon",
      },
      {
        icon: "👨‍👩‍👧‍👦",
        titleKey: "landing.safety.parentalTitle",
        descriptionKey: "landing.safety.parentalDesc",
        colorClass: "purple-icon",
      },
      {
        icon: "🌟",
        titleKey: "landing.safety.communityTitle",
        descriptionKey: "landing.safety.communityDesc",
        colorClass: "pink-icon",
      },
    ];
  }
}
