import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="faq-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t("landing.faq.title") }}</h2>
          <p class="section-subtitle">{{ t("landing.faq.subtitle") }}</p>
        </div>

        <div class="faq-list">
          <div
            class="faq-item"
            *ngFor="let faq of faqs"
            [class.open]="faq.isOpen"
          >
            <button class="faq-question" (click)="toggleFaq(faq)">
              <span>{{ faq.question }}</span>
              <span class="faq-icon" [class.rotate]="faq.isOpen">+</span>
            </button>
            <div class="faq-answer" [class.show]="faq.isOpen">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./faq.component.scss"],
})
export class FaqComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  faqs: any[] = [];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.initializeFaqs();
    this.subscription.add(
      this.translationService.selectedLanguage$.subscribe(() => {
        // Reinitialize FAQs when language changes
        this.initializeFaqs();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  initializeFaqs(): void {
    this.faqs = [
      {
        question: this.t("landing.faq.q1"),
        answer: this.t("landing.faq.a1"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q2"),
        answer: this.t("landing.faq.a2"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q3"),
        answer: this.t("landing.faq.a3"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q4"),
        answer: this.t("landing.faq.a4"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q5"),
        answer: this.t("landing.faq.a5"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q6"),
        answer: this.t("landing.faq.a6"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q7"),
        answer: this.t("landing.faq.a7"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q8"),
        answer: this.t("landing.faq.a8"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q9"),
        answer: this.t("landing.faq.a9"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q10"),
        answer: this.t("landing.faq.a10"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q11"),
        answer: this.t("landing.faq.a11"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q12"),
        answer: this.t("landing.faq.a12"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q13"),
        answer: this.t("landing.faq.a13"),
        isOpen: false,
      },
      {
        question: this.t("landing.faq.q14"),
        answer: this.t("landing.faq.a14"),
        isOpen: false,
      },
    ];
  }

  toggleFaq(faq: any): void {
    faq.isOpen = !faq.isOpen;
  }
}
