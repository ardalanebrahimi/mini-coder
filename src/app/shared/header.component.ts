import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { TranslationService } from "../services/translation.service";
import { ToolboxService } from "../services/toolbox.service";
import { StorageService } from "../services/storage.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  currentUser$: Observable<any>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService,
    private toolboxService: ToolboxService,
    private storageService: StorageService
  ) {
    this.currentUser$ = this.authService.currentUser$;
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
    this.toolboxService.toggle();
  }

  get showToolbox(): boolean {
    return this.toolboxService.isOpen();
  }

  get savedProjectsCount(): number {
    return this.storageService.getAllProjects().length;
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
}
