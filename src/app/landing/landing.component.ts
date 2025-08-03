import { Component, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from "@angular/core";
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
import { AppPopupComponent } from "../app-popup/app-popup.component";
import { AnalyticsService } from "../services/analytics.service";
import { AuthService } from "../services/auth.service";

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
    AppPopupComponent,
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
        (startCreating)="onStartCreating()"
        (browseApps)="onBrowseApps()"
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

      <!-- App Popup -->
      <app-app-popup
        (showAuthModalEvent)="showAuthModalWithMessage($event)"
      ></app-app-popup>
    </div>
  `,
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent implements OnInit, OnDestroy {
  showAuthModal = false;
  authModalMessage = "";
  private pageStartTime = Date.now();
  private sectionObserver?: IntersectionObserver;

  constructor(
    private router: Router,
    private analytics: AnalyticsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Log landing page visit
    this.analytics.logLandingPageVisited();

    // Set up scroll tracking for sections
    this.setupSectionTracking();

    // Track performance metrics after page load
    setTimeout(() => {
      this.analytics.logPerformanceMetrics();
    }, 2000);

    // Track session end when user leaves
    this.setupBeforeUnloadTracking();
  }

  ngOnDestroy(): void {
    // Log session metrics before component is destroyed
    this.analytics.logSessionMetrics();
    
    // Clean up observers
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
  }

  private setupBeforeUnloadTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.analytics.logSessionMetrics();
      });

      // Also track visibility changes (user switching tabs)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.analytics.logSessionMetrics();
        }
      });
    }
  }

  private setupSectionTracking(): void {
    // Set up intersection observer to track section viewing
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.id || entry.target.tagName.toLowerCase();
            const timeOnPage = Date.now() - this.pageStartTime;
            const scrollPosition = Math.round(
              (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );

            this.analytics.logSectionViewed(sectionName, scrollPosition, timeOnPage);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
      }
    );

    // Set up general click tracking for buttons and links
    this.setupClickTracking();

    // Observe sections after a short delay to ensure DOM is ready
    setTimeout(() => {
      const sections = document.querySelectorAll('section, app-hero, app-features, app-how-it-works, app-video-section, app-app-gallery, app-safety-section, app-faq, app-cta-section');
      sections.forEach((section) => {
        if (this.sectionObserver) {
          this.sectionObserver.observe(section);
        }
      });
    }, 1000);
  }

  private setupClickTracking(): void {
    if (typeof document !== 'undefined') {
      // Track all button clicks with analytics
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        
        // Track button clicks
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          const button = target.tagName === 'BUTTON' ? target : target.closest('button');
          const buttonText = button?.textContent?.trim() || '';
          const section = button?.closest('section')?.id || button?.closest('[class*="section"]')?.className || 'unknown';
          
          this.analytics.logEvent('button_clicked' as any, {
            buttonClicked: {
              buttonText,
              section,
              userType: this.authService.isLoggedIn() ? "logged_in" : "guest",
            },
          });
        }

        // Track link clicks
        if (target.tagName === 'A' || target.closest('a')) {
          const link = target.tagName === 'A' ? target : target.closest('a');
          const href = link?.getAttribute('href') || '';
          const linkText = link?.textContent?.trim() || '';
          
          this.analytics.logEvent('link_clicked' as any, {
            linkClicked: {
              href,
              linkText,
              userType: this.authService.isLoggedIn() ? "logged_in" : "guest",
            },
          });
        }
      });
    }
  }

  onTryItFree(): void {
    // Log hero CTA click
    this.analytics.logHeroCTAClicked("try_it_free");
    
    // Show auth modal for try it free
    this.authModalMessage = "Welcome! Sign up to start creating amazing apps!";
    this.showAuthModal = true;
  }

  onBrowseCommunity(): void {
    // Log hero browse click
    this.analytics.logHeroCTAClicked("browse_community");
    
    // Scroll to app gallery section
    setTimeout(() => {
      const appGalleryElement = document.getElementById("app-gallery");
      if (appGalleryElement) {
        appGalleryElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  onTryApp(appId: number): void {
    // Log gallery app click
    this.analytics.logGalleryAppClicked(
      appId.toString(),
      `Sample App ${appId}`,
      appId // Using appId as position for now
    );
    
    // Show auth modal for trying apps
    this.authModalMessage = "Log in to try this awesome app!";
    this.showAuthModal = true;
  }

  onExploreMore(): void {
    // Log as a browse action
    this.analytics.logCTASectionClicked("browse_apps");
    
    // Show auth modal for exploring more apps
    this.authModalMessage = "Log in to explore more community creations!";
    this.showAuthModal = true;
  }

  onStartCreating(): void {
    // Log CTA section click (analytics already logged in CTA component)
    this.onTryItFree();
  }

  onBrowseApps(): void {
    // Log CTA section click (analytics already logged in CTA component)
    this.onBrowseCommunity();
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

  showAuthModalWithMessage(message: string): void {
    // Log login prompt shown
    this.analytics.logLoginPromptShown("app_popup_interaction");
    
    this.authModalMessage = message;
    this.showAuthModal = true;
  }
}
