import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-features",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Why Kids Love MiniCoder</h2>
          <p class="section-subtitle">
            We've built the perfect platform for young creators to bring their
            ideas to life safely and easily
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
  features = [
    {
      icon: "⚡",
      title: "AI-Powered Creation",
      description:
        "Build games and tools instantly with our smart AI that understands what kids want to create",
      colorClass: "bg-yellow",
    },
    {
      icon: "🛡️",
      title: "Safe & Secure",
      description:
        "Privacy-first design with no personal data collection. Parents can trust us with their kids",
      colorClass: "bg-green",
    },
    {
      icon: "❤️",
      title: "Kid-Friendly Design",
      description:
        "Colorful, intuitive interface designed specifically for children aged 7-12 years old",
      colorClass: "bg-pink",
    },
    {
      icon: "👥",
      title: "Community Sharing",
      description:
        "Discover and play thousands of games created by other young developers around the world",
      colorClass: "bg-blue",
    },
    {
      icon: "🎮",
      title: "Instant Play",
      description:
        "No downloads or installations - play any game directly right away",
      colorClass: "bg-purple",
    },
    {
      icon: "🎨",
      title: "Creative Freedom",
      description:
        "From simple memory games to complex adventures - the only limit is your imagination",
      colorClass: "bg-orange",
    },
  ];
}
