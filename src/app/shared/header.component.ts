import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { TranslationService } from "../services/translation.service";
import { ToolboxService } from "../services/toolbox.service";
import { StorageService } from "../services/storage.service";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "../services/analytics.service";
import { Observable, map, catchError, of } from "rxjs";
import { AuthModalComponent } from "./auth-modal.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthModalComponent],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<any>;
  showAuthModal = false;
  authModalMessage = "";
  isLogin = false;
  // savedProjectsCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService,
    public toolboxService: ToolboxService,
    private storageService: StorageService,
    private analytics: AnalyticsService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    // this.savedProjectsCount$ = of(0); // Initialize with 0
  }

  ngOnInit(): void {
    // Only load projects count if user is authenticated
    // this.currentUser$.subscribe((user) => {
    //   if (user && this.authService.isLoggedIn()) {
    //     this.savedProjectsCount$ = this.storageService
    //       .getProjectsCount()
    //       .pipe(catchError(() => of(0)));
    //   } else {
    //     this.savedProjectsCount$ = of(0);
    //   }
    // });
  }

  // Translation methods
  t(key: string): string {
    return this.translationService.t(key);
  }

  get availableLanguages() {
    return this.translationService.getAvailableLanguages();
  }

  get selectedLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  changeLanguage(languageCode: string): void {
    // Log language change
    this.analytics.logHeaderLanguageChanged(
      this.selectedLanguage,
      languageCode
    );

    this.translationService.setLanguage(languageCode);
  }

  // Toolbox methods
  toggleToolbox(): void {
    // Log toolbox toggle
    this.analytics.logHeaderToolboxClicked(this.router.url);

    // Always allow toolbox to open, but content will differ based on auth status
    this.toolboxService.toggle();
  }

  get showToolbox(): boolean {
    return this.toolboxService.isOpen();
  }

  // Auth methods
  logout(): void {
    // Log logout action
    this.analytics.logHeaderLogoutClicked(this.router.url);

    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  // Check if current route is the main app
  get isAppRoute(): boolean {
    return this.router.url === "/home";
  }

  openAuthModal(isLogin: boolean): void {
    // Log auth modal opening
    if (isLogin) {
      this.analytics.logHeaderLoginClicked(this.router.url);
    } else {
      this.analytics.logHeaderRegisterClicked(this.router.url);
    }

    this.isLogin = isLogin;
    this.authModalMessage = isLogin
      ? "Welcome Back! Please log in to continue."
      : "Welcome! Sign up to start creating amazing apps!";
    this.showAuthModal = true;
  }

  closeAuthModal(): void {
    // Log auth modal closing (if it was closed without completing auth)
    if (this.showAuthModal) {
      this.analytics.logAuthModalClosed(
        this.isLogin ? "login" : "register",
        false // closed without completion
      );
    }

    this.showAuthModal = false;
    this.authModalMessage = "";
  }

  onAuthSuccess(user: any): void {
    // Log successful authentication
    this.analytics.logEvent(AnalyticsEventType.AUTH_LOGIN, {
      authLogin: {
        location: "header",
        loginMethod: this.isLogin ? "login" : "register",
        userType: "logged_in",
        success: true,
      },
    });

    // Also log modal completion
    this.analytics.logAuthModalClosed(
      this.isLogin ? "login" : "register",
      true // completed successfully
    );

    this.closeAuthModal();
    // Navigate to home after successful auth
    this.router.navigate(["/home"]);
  }

  // Navigation tracking methods
  onLogoClick(): void {
    this.analytics.logEvent(AnalyticsEventType.NAVIGATION_CHANGED, {
      navigationChanged: {
        fromView: this.router.url,
        toView: "/landing",
        userType: this.authService.isLoggedIn() ? "logged_in" : "guest",
        trigger: "header_logo",
      },
    });
  }

  onAppButtonClick(): void {
    this.analytics.logEvent(AnalyticsEventType.NAVIGATION_CHANGED, {
      navigationChanged: {
        fromView: this.router.url,
        toView: "/home",
        userType: this.authService.isLoggedIn() ? "logged_in" : "guest",
        trigger: "header_app_button",
      },
    });
  }
}
