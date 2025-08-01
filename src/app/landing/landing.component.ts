import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { HeroComponent } from "./hero/hero.component";
import { FeaturesComponent } from "./features/features.component";
import { HowItWorksComponent } from "./how-it-works/how-it-works.component";
import { VideoSectionComponent } from "./video-section/video-section.component";
import { AppGalleryComponent } from "./app-gallery/app-gallery.component";
import { SafetySectionComponent } from "./safety-section/safety-section.component";
import { TestimonialsComponent } from "./testimonials/testimonials.component";
import { FaqComponent } from "./faq/faq.component";
import { CtaSectionComponent } from "./cta-section/cta-section.component";
import { FooterComponent } from "./footer/footer.component";
import { AuthModalComponent } from "../shared/auth-modal.component";

@Component({
  selector: "app-landing",
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    FeaturesComponent,
    HowItWorksComponent,
    VideoSectionComponent,
    AppGalleryComponent,
    SafetySectionComponent,
    TestimonialsComponent,
    FaqComponent,
    CtaSectionComponent,
    FooterComponent,
    AuthModalComponent,
  ],
  template: `
    <div class="landing-page">
      <app-hero
        (tryItFree)="onTryItFree()"
        (browseCommunity)="onBrowseCommunity()"
      >
      </app-hero>

      <app-how-it-works></app-how-it-works>

      <app-video-section></app-video-section>

      <app-features></app-features>

      <app-app-gallery
        (tryApp)="onTryApp($event)"
        (exploreMore)="onExploreMore()"
      ></app-app-gallery>

      <app-safety-section></app-safety-section>

      <app-testimonials *ngIf="false"></app-testimonials>

      <app-faq></app-faq>

      <app-cta-section
        (startCreating)="onTryItFree()"
        (browseApps)="onBrowseCommunity()"
      >
      </app-cta-section>

      <app-footer></app-footer>

      <!-- Auth Modal -->
      <app-auth-modal
        [isOpen]="showAuthModal"
        [message]="authModalMessage"
        (closeModal)="closeAuthModal()"
        (authSuccess)="onAuthSuccess($event)"
      ></app-auth-modal>
    </div>
  `,
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent {
  showAuthModal = false;
  authModalMessage = "";

  constructor(private router: Router) {}

  onTryItFree(): void {
    // Show auth modal for try it free
    this.authModalMessage = "Welcome! Sign up to start creating amazing apps!";
    this.showAuthModal = true;
  }

  onBrowseCommunity(): void {
    // Scroll to app gallery section
    setTimeout(() => {
      const appGalleryElement = document.getElementById("app-gallery");
      if (appGalleryElement) {
        appGalleryElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  onTryApp(appId: number): void {
    // Show auth modal for trying apps
    this.authModalMessage = "Log in to try this awesome app!";
    this.showAuthModal = true;
  }

  onExploreMore(): void {
    // Show auth modal for exploring more apps
    this.authModalMessage = "Log in to explore more community creations!";
    this.showAuthModal = true;
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
    this.authModalMessage = "";
  }

  onAuthSuccess(user: any): void {
    this.closeAuthModal();
    // Navigate to home after successful auth
    this.router.navigate(["/home"]);
  }
}
