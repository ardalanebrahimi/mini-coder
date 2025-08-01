import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-cta-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">Ready to Start Creating?</h2>
        <p class="cta-subtitle">
          Join thousands of young creators building amazing games and tools with
          MiniCoder
        </p>
        <div class="cta-buttons">
          <button class="btn btn-primary btn-lg" (click)="onStartCreating()">
            <span class="btn-icon">✨</span>
            Start Creating for Free
          </button>
          <button class="btn btn-secondary btn-lg" (click)="onBrowseApps()">
            Browse Community Apps
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./cta-section.component.scss"],
})
export class CtaSectionComponent {
  @Output() startCreating = new EventEmitter<void>();
  @Output() browseApps = new EventEmitter<void>();

  onStartCreating(): void {
    this.startCreating.emit();
  }

  onBrowseApps(): void {
    this.browseApps.emit();
  }
}
