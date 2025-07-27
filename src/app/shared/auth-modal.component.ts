import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-auth-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>
            <span class="emoji">🔐</span>
            {{ isLogin ? t("loginRequired") : t("registerRequired") }}
          </h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <div class="modal-body">
          <div class="auth-notice">
            <p>{{ message || t("authRequiredMessage") }}</p>
          </div>

          <!-- Login Form -->
          <form *ngIf="isLogin" (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <label for="email">{{ t("email") }}</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="credentials.email"
                name="email"
                required
                [placeholder]="t('emailPlaceholder')"
              />
            </div>

            <div class="form-group">
              <label for="password">{{ t("password") }}</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="credentials.password"
                name="password"
                required
                [placeholder]="t('passwordPlaceholder')"
              />
            </div>

            <div class="error-message" *ngIf="error">
              {{ error }}
            </div>

            <button
              type="submit"
              class="submit-btn"
              [disabled]="
                isLoading || !credentials.email || !credentials.password
              "
            >
              <span *ngIf="!isLoading">{{ t("login") }}</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>

            <div class="auth-switch">
              <p>
                {{ t("noAccount") }}
                <button
                  type="button"
                  class="link-btn"
                  (click)="switchToRegister()"
                >
                  {{ t("register") }}
                </button>
              </p>
            </div>
          </form>

          <!-- Register Form -->
          <form *ngIf="!isLogin" (ngSubmit)="onRegister()" class="auth-form">
            <div class="form-group">
              <label for="name">{{ t("name") }}</label>
              <input
                type="text"
                id="name"
                [(ngModel)]="registerData.name"
                name="name"
                required
                [placeholder]="t('namePlaceholder')"
              />
            </div>

            <div class="form-group">
              <label for="reg-email">{{ t("email") }}</label>
              <input
                type="email"
                id="reg-email"
                [(ngModel)]="registerData.email"
                name="email"
                required
                [placeholder]="t('emailPlaceholder')"
              />
            </div>

            <div class="form-group">
              <label for="reg-password">{{ t("password") }}</label>
              <input
                type="password"
                id="reg-password"
                [(ngModel)]="registerData.password"
                name="password"
                required
                [placeholder]="t('passwordPlaceholder')"
              />
            </div>

            <div class="error-message" *ngIf="error">
              {{ error }}
            </div>

            <button
              type="submit"
              class="submit-btn"
              [disabled]="
                isLoading ||
                !registerData.email ||
                !registerData.password ||
                !registerData.name
              "
            >
              <span *ngIf="!isLoading">{{ t("register") }}</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>

            <div class="auth-switch">
              <p>
                {{ t("haveAccount") }}
                <button
                  type="button"
                  class="link-btn"
                  (click)="switchToLogin()"
                >
                  {{ t("login") }}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
      }

      .modal-header h2 {
        margin: 0;
        color: #333;
        font-size: 1.5em;
      }

      .emoji {
        margin-right: 8px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .close-btn:hover {
        background-color: #f0f0f0;
        color: #333;
      }

      .modal-body {
        padding: 24px;
      }

      .auth-notice {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
        color: #856404;
      }

      .auth-notice p {
        margin: 0;
        text-align: center;
      }

      .auth-form {
        max-width: 400px;
        margin: 0 auto;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .form-group input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .form-group input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .error-message {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        color: #721c24;
        padding: 12px;
        margin-bottom: 20px;
        text-align: center;
      }

      .submit-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 20px;
        position: relative;
      }

      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .submit-btn:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }

      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .auth-switch {
        text-align: center;
      }

      .auth-switch p {
        margin: 0;
        color: #666;
      }

      .link-btn {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        text-decoration: underline;
        font-size: inherit;
        padding: 0;
        margin-left: 4px;
      }

      .link-btn:hover {
        color: #0056b3;
      }
    `,
  ],
})
export class AuthModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() message = "";
  @Output() closeModal = new EventEmitter<void>();
  @Output() authSuccess = new EventEmitter<any>();

  isLogin = true;
  isLoading = false;
  error = "";

  credentials = {
    email: "",
    password: "",
  };

  registerData = {
    name: "",
    email: "",
    password: "",
  };

  constructor(
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Reset form when modal opens
    if (this.isOpen) {
      this.resetForms();
    }
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  onOverlayClick(event: Event): void {
    this.onClose();
  }

  onClose(): void {
    this.resetForms();
    this.closeModal.emit();
  }

  switchToLogin(): void {
    this.isLogin = true;
    this.error = "";
  }

  switchToRegister(): void {
    this.isLogin = false;
    this.error = "";
  }

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = this.t("fillAllFields");
      return;
    }

    this.isLoading = true;
    this.error = "";

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authSuccess.emit(response.user);
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || this.t("loginFailed");
      },
    });
  }

  onRegister(): void {
    if (
      !this.registerData.name ||
      !this.registerData.email ||
      !this.registerData.password
    ) {
      this.error = this.t("fillAllFields");
      return;
    }

    this.isLoading = true;
    this.error = "";

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authSuccess.emit(response.user);
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || this.t("registrationFailed");
      },
    });
  }

  private resetForms(): void {
    this.credentials = { email: "", password: "" };
    this.registerData = { name: "", email: "", password: "" };
    this.error = "";
    this.isLoading = false;
    this.isLogin = true;
  }
}
