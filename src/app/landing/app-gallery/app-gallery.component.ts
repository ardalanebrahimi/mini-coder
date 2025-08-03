import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppPopupService } from "../../services/app-popup.service";
import { AppStoreService } from "../../services/app-store.service";
import { TranslationService } from "../../services/translation.service";
import { catchError, of, Subscription } from "rxjs";

@Component({
  selector: "app-app-gallery",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="app-gallery" class="app-gallery-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t("landing.gallery.title") }}</h2>
          <p class="section-subtitle">
            {{ t("landing.gallery.subtitle") }}
          </p>
        </div>

        <div class="gallery-grid">
          <div
            class="app-card"
            *ngFor="let app of sampleApps"
            (click)="onTryApp(app.id)"
          >
            <div class="app-preview">
              <img
                [src]="app.screenshot"
                [alt]="t(app.titleKey)"
                class="app-screenshot"
              />
              <div class="app-overlay">
                <span class="play-button">▶️</span>
                <span class="try-text">{{ t("landing.gallery.tryApp") }}</span>
              </div>
            </div>
            <div class="app-info">
              <h3 class="app-title">{{ t(app.titleKey) }}</h3>
              <p class="app-description">{{ t(app.descriptionKey) }}</p>
              <div class="app-meta">
                <span class="creator"
                  >{{ t("landing.gallery.by") }} {{ app.creator }}</span
                >
                <div class="rating">
                  <span class="stars">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <button class="btn btn-hero btn-xl" (click)="onExploreMore()">
            {{ t("landing.gallery.exploreMore") }}
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./app-gallery.component.scss"],
})
export class AppGalleryComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  @Output() tryApp = new EventEmitter<number>();
  @Output() exploreMore = new EventEmitter<void>();

  constructor(
    private appPopupService: AppPopupService,
    private appStoreService: AppStoreService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
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

  get sampleApps() {
    return [
      {
        id: 16,
        titleKey: "landing.gallery.app1.title",
        descriptionKey: "landing.gallery.app1.description",
        creator: "Mani, age 8",
        screenshot: "/assets/images/85964bc5-1146-4e4a-bb80-50af75891db1.png",
      },
      {
        id: 9,
        titleKey: "landing.gallery.app2.title",
        descriptionKey: "landing.gallery.app2.description",
        creator: "Mani, age 8",
        screenshot: "/assets/images/c500949a-e207-4262-b614-c25704498a5d.png",
      },
      {
        id: 34,
        titleKey: "landing.gallery.app3.title",
        descriptionKey: "landing.gallery.app3.description",
        creator: "Mani, age 8",
        screenshot: "/assets/images/tic-tac-toe.png",
      },
    ];
  }

  onTryApp(appId: number): void {
    // Find the app details from our sample apps
    const app = this.sampleApps.find((a) => a.id === appId);
    if (app) {
      // For sample apps, we could either:
      // 1. Load from app store if they have real IDs
      // 2. Create mock data for the popup
      // For now, let's try to load from app store
      this.appStoreService
        .getPublicProject(appId)
        .pipe(
          catchError((error) => {
            console.log("Sample app not found in store, using fallback");
            // Fallback: emit to parent for auth modal
            this.tryApp.emit(appId);
            return of(null);
          })
        )
        .subscribe({
          next: (project) => {
            if (project) {
              this.appPopupService.openAppStoreProject(project);
            }
          },
        });
    } else {
      // Fallback to original behavior
      this.tryApp.emit(appId);
    }
  }

  onExploreMore(): void {
    this.exploreMore.emit();
  }
}
