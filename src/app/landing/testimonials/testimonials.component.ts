import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: "app-testimonials",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t("landing.testimonials.title") }}</h2>
        </div>

        <div class="testimonials-grid">
          <div
            class="testimonial-card"
            *ngFor="let testimonial of testimonials"
          >
            <div class="testimonial-content">
              <p class="testimonial-text">"{{ t(testimonial.textKey) }}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">{{ testimonial.avatar }}</div>
                <div class="author-info">
                  <div class="author-name">{{ t(testimonial.authorKey) }}</div>
                  <div class="author-role">{{ t(testimonial.roleKey) }}</div>
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
export class TestimonialsComponent implements OnInit, OnDestroy {
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

  get testimonials() {
    return [
      {
        textKey: "landing.testimonials.t1.text",
        authorKey: "landing.testimonials.t1.author",
        roleKey: "landing.testimonials.t1.role",
        avatar: "👩",
      },
      {
        textKey: "landing.testimonials.t2.text",
        authorKey: "landing.testimonials.t2.author",
        roleKey: "landing.testimonials.t2.role",
        avatar: "👨",
      },
      {
        textKey: "landing.testimonials.t3.text",
        authorKey: "landing.testimonials.t3.author",
        roleKey: "landing.testimonials.t3.role",
        avatar: "👧",
      },
    ];
  }
}
