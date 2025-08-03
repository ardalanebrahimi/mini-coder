import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { TranslationService } from "../../services/translation.service";
import { AnalyticsService } from "../../services/analytics.service";

@Component({
  selector: "app-cta-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">{{ t("landing.cta.title") }}</h2>
        <p class="cta-subtitle">
          {{ t("landing.cta.subtitle") }}
        </p>
        <div class="cta-buttons">
          <button class="btn btn-primary btn-lg" (click)="onStartCreating()">
            <span class="btn-icon">✨</span>
            {{ t("landing.cta.startCreating") }}
          </button>
          <button class="btn btn-secondary btn-lg" (click)="onBrowseApps()">
            {{ t("landing.cta.browseApps") }}
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./cta-section.component.scss"],
})
export class CtaSectionComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  @Output() startCreating = new EventEmitter<void>();
  @Output() browseApps = new EventEmitter<void>();

  constructor(
    private translationService: TranslationService,
    private analytics: AnalyticsService
  ) {}

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

  onStartCreating(): void {
    // Log CTA section click
    this.analytics.logCTASectionClicked("start_creating");
    this.startCreating.emit();
  }

  onBrowseApps(): void {
    // Log CTA section click
    this.analytics.logCTASectionClicked("browse_apps");
    this.browseApps.emit();
  }
}
