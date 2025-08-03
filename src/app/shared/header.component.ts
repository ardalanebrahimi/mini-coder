import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { TranslationService } from "../services/translation.service";
import { ToolboxService } from "../services/toolbox.service";
import { StorageService } from "../services/storage.service";
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
    private storageService: StorageService
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
    this.translationService.setLanguage(languageCode);
  }

  // Toolbox methods
  toggleToolbox(): void {
    // Always allow toolbox to open, but content will differ based on auth status
    this.toolboxService.toggle();
  }

  get showToolbox(): boolean {
    return this.toolboxService.isOpen();
  }

  // Auth methods
  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  // Check if current route is the main app
  get isAppRoute(): boolean {
    return this.router.url === "/home";
  }

  openAuthModal(isLogin: boolean): void {
    this.isLogin = isLogin;
    this.authModalMessage = isLogin
      ? "Welcome Back! Please log in to continue."
      : "Welcome! Sign up to start creating amazing apps!";
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
