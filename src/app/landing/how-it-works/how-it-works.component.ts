import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: "app-how-it-works",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="how-it-works-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t("landing.howItWorks.title") }}</h2>
          <p class="section-subtitle">
            {{ t("landing.howItWorks.subtitle") }}
          </p>
        </div>

        <div class="steps-grid">
          <div class="step-card" *ngFor="let step of steps; let i = index">
            <div class="step-icon-container">
              <!-- Step number -->
              <div class="step-number">{{ i + 1 }}</div>

              <!-- Icon container -->
              <div class="step-icon-wrapper" [ngClass]="step.color">
                <ng-container [ngSwitch]="step.icon">
                  <svg
                    *ngSwitchCase="'message'"
                    class="step-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <svg
                    *ngSwitchCase="'wand'"
                    class="step-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M7.5 5.6L5 7L6.4 4.5L5 2L7.5 3.4L10 2L8.6 4.5L10 7L7.5 5.6ZM19.5 15.4L22 14L20.6 16.5L22 19L19.5 17.6L17 19L18.4 16.5L17 14L19.5 15.4ZM22 2L20.6 4.5L22 7L19.5 5.6L17 7L18.4 4.5L17 2L19.5 3.4L22 2ZM13.34 12.78L15.78 10.34L13.66 8.22L11.22 10.66L13.34 12.78ZM14.37 7.29L16.71 9.63C17.1 10.02 17.1 10.65 16.71 11.04L5.04 22.71C4.65 23.1 4.02 23.1 3.63 22.71L1.29 20.37C0.9 19.98 0.9 19.35 1.29 18.96L12.96 7.29C13.35 6.9 13.98 6.9 14.37 7.29Z"
                    />
                  </svg>
                  <svg
                    *ngSwitchCase="'play'"
                    class="step-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg
                    *ngSwitchCase="'share'"
                    class="step-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
                    />
                  </svg>
                </ng-container>
              </div>
            </div>

            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./how-it-works.component.scss"],
})
export class HowItWorksComponent {
  constructor(private translationService: TranslationService) {}

  /**
   * Translation helper method
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  get steps() {
    return [
      {
        icon: "message",
        title: this.t("landing.howItWorks.step1"),
        description: this.t("landing.howItWorks.step1Desc"),
        color: "color-purple",
      },
      {
        icon: "wand",
        title: this.t("landing.howItWorks.step2"),
        description: this.t("landing.howItWorks.step2Desc"),
        color: "color-pink",
      },
      {
        icon: "play",
        title: this.t("landing.howItWorks.step3"),
        description: this.t("landing.howItWorks.step3Desc"),
        color: "color-green",
      },
      {
        icon: "share",
        title: this.t("landing.howItWorks.step4"),
        description: this.t("landing.howItWorks.step4Desc"),
        color: "color-blue",
      },
    ];
  }
}
