import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-testimonials",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">What Families Are Saying</h2>
        </div>

        <div class="testimonials-grid">
          <div
            class="testimonial-card"
            *ngFor="let testimonial of testimonials"
          >
            <div class="testimonial-content">
              <p class="testimonial-text">"{{ testimonial.text }}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">{{ testimonial.avatar }}</div>
                <div class="author-info">
                  <div class="author-name">{{ testimonial.author }}</div>
                  <div class="author-role">{{ testimonial.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./testimonials.component.scss"],
})
export class TestimonialsComponent {
  testimonials = [
    {
      text: "My daughter created her first game in just 10 minutes! She's so proud and keeps showing it to everyone.",
      author: "Sarah M.",
      role: "Parent of Emma, 9",
      avatar: "👩",
    },
    {
      text: "Finally, a platform where my son can be creative without me worrying about inappropriate content or privacy issues.",
      author: "Mike R.",
      role: "Father of Alex, 8",
      avatar: "👨",
    },
    {
      text: "The AI understands exactly what I want to make. It's like having a magic coding assistant!",
      author: "Lily K.",
      role: "Age 12",
      avatar: "👧",
    },
  ];
}
