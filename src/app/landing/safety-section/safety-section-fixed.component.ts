import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

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
            <span class="trust-text">Trusted by Parents</span>
          </div>
          <h2 class="section-title">Your Child's Safety is Our Priority</h2>
          <p class="section-subtitle">
            We've built MiniCoder with the highest safety and privacy standards.
            Parents can feel confident letting their kids explore and create.
          </p>
        </div>

        <div class="safety-grid">
          <div class="safety-card" *ngFor="let feature of safetyFeatures">
            <div class="card-icon" [ngClass]="feature.colorClass">
              <span class="feature-emoji">{{ feature.icon }}</span>
            </div>
            <h3 class="card-title">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
          </div>
        </div>

        <div class="compliance-section">
          <h3 class="compliance-title">COPPA & GDPR Compliant</h3>
          <p class="compliance-text">
            MiniCoder is fully compliant with child privacy laws including COPPA
            (Children's Online Privacy Protection Act) and GDPR. We're committed
            to creating a safe digital playground where creativity can flourish.
          </p>
          <div class="compliance-badges">
            <span class="badge coppa">✅ COPPA Compliant</span>
            <span class="badge gdpr">🔒 GDPR Compliant</span>
            <span class="badge moderated">👥 Content Moderated</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./safety-section.component.scss"],
})
export class SafetySectionComponent {
  safetyFeatures = [
    {
      icon: "🔒",
      title: "Privacy-First Design",
      description:
        "We never collect personal information from children. No email addresses, names, or photos required.",
      colorClass: "green-icon",
    },
    {
      icon: "🛡️",
      title: "Secure Platform",
      description:
        "All content is moderated and games run in a safe, sandboxed environment with no external access.",
      colorClass: "blue-icon",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Parental Oversight",
      description:
        "Parents can review all games their children create and have full control over sharing settings.",
      colorClass: "purple-icon",
    },
    {
      icon: "🌟",
      title: "Kid-Safe Community",
      description:
        "All shared content is reviewed by our safety team. No chat features or personal messaging.",
      colorClass: "pink-icon",
    },
  ];
}
