import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-app-gallery",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="app-gallery" class="app-gallery-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Community Creations</h2>
          <p class="section-subtitle">
            Discover amazing games and tools created by young developers like
            you!
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
                [alt]="app.title"
                class="app-screenshot"
              />
              <div class="app-overlay">
                <span class="play-button">▶️</span>
                <span class="try-text">Try App</span>
              </div>
            </div>
            <div class="app-info">
              <h3 class="app-title">{{ app.title }}</h3>
              <p class="app-description">{{ app.description }}</p>
              <div class="app-meta">
                <span class="creator">By {{ app.creator }}</span>
                <div class="rating">
                  <span class="stars">⭐⭐⭐⭐⭐</span>
                  <span class="plays">{{ app.plays }} plays</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <button class="btn btn-hero btn-xl" (click)="onExploreMore()">
            Login to Explore More Games
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./app-gallery.component.scss"],
})
export class AppGalleryComponent {
  @Output() tryApp = new EventEmitter<number>();
  @Output() exploreMore = new EventEmitter<void>();

  sampleApps = [
    {
      id: 20,
      title: "Magic Memory Match",
      description: "A colorful memory game with magical creatures",
      creator: "Emma, age 9",
      plays: "1.2k",
      screenshot: "/assets/images/85964bc5-1146-4e4a-bb80-50af75891db1.png",
    },
    {
      id: 21,
      title: "Space Adventure",
      description: "Navigate through asteroids and collect stars",
      creator: "Max, age 11",
      plays: "2.8k",
      screenshot: "/assets/images/c500949a-e207-4262-b614-c25704498a5d.png",
    },
    {
      id: 22,
      title: "Pet Care Simulator",
      description: "Take care of virtual pets and watch them grow",
      creator: "Sophia, age 10",
      plays: "3.1k",
      screenshot: "/assets/images/f83eb254-5637-4164-8246-44d5ebd7d67a.png",
    },
  ];

  onTryApp(appId: number): void {
    this.tryApp.emit(appId);
  }

  onExploreMore(): void {
    this.exploreMore.emit();
  }
}
