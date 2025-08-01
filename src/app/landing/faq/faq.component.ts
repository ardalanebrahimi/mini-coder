import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="faq-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Frequently Asked Questions</h2>
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
export class FaqComponent {
  faqs = [
    {
      question: "Is MiniCoder really safe for my child?",
      answer:
        "Absolutely! We use privacy-first design with no personal data collection. All content is moderated, and parents have full control over their child's account.",
      isOpen: false,
    },
    {
      question: "What age group is MiniCoder designed for?",
      answer:
        "MiniCoder is specifically designed for children aged 7-12 years old, with an intuitive interface and age-appropriate content.",
      isOpen: false,
    },
    {
      question: "Do kids need to know how to code?",
      answer:
        "Not at all! Our AI-powered platform lets kids create games and tools just by describing what they want in plain language.",
      isOpen: false,
    },
    {
      question: "How much does MiniCoder cost?",
      answer:
        "We offer a free tier with basic features, and affordable premium plans for families who want advanced features and more storage.",
      isOpen: false,
    },
    {
      question: "Can my child share their creations?",
      answer:
        "Yes! Kids can safely share their games with friends and the community. All shared content goes through our moderation system first.",
      isOpen: false,
    },
    {
      question: "What kind of games can kids create?",
      answer:
        "Kids can create puzzle games, adventure games, educational tools, art projects, and much more. The only limit is their imagination!",
      isOpen: false,
    },
    {
      question: "Is there parental supervision?",
      answer:
        "Yes! Parents can review all projects, control sharing settings, and monitor their child's activity through our parent dashboard.",
      isOpen: false,
    },
    {
      question: "Does MiniCoder work on tablets and phones?",
      answer:
        "MiniCoder works best on computers but is also compatible with tablets. We're working on a mobile app coming soon!",
      isOpen: false,
    },
    {
      question: "How long does it take to create a game?",
      answer:
        "Simple games can be created in just a few minutes! More complex projects might take an hour or two, depending on the child's vision.",
      isOpen: false,
    },
    {
      question: "Can multiple kids work together on a project?",
      answer:
        "Currently, each project is created by one child, but kids can definitely inspire each other by sharing and remixing games!",
      isOpen: false,
    },
    {
      question: "What if my child gets frustrated or stuck?",
      answer:
        "Our AI assistant is designed to be patient and helpful. We also provide step-by-step tutorials and a supportive community of young creators.",
      isOpen: false,
    },
    {
      question: "Can kids learn real programming skills?",
      answer:
        "While kids start with natural language, they gradually learn programming concepts like loops, conditions, and logic through our visual tools.",
      isOpen: false,
    },
    {
      question: "Is there a time limit for using MiniCoder?",
      answer:
        "Parents can set usage limits through parental controls. We also encourage healthy breaks with built-in reminders.",
      isOpen: false,
    },
    {
      question: "What devices and browsers are supported?",
      answer:
        "MiniCoder works on Windows, Mac, and Chromebooks with modern browsers like Chrome, Firefox, Safari, and Edge.",
      isOpen: false,
    },
  ];

  toggleFaq(faq: any): void {
    faq.isOpen = !faq.isOpen;
  }
}
