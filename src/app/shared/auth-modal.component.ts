import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-auth-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2>
            <span class="emoji">🎨</span>
            {{ isLogin ? "Welcome Back!" : "Join MiniCoder!" }}
          </h2>
          <button class="close-btn" (click)="onClose()" type="button">
            <span class="emoji">❌</span>
          </button>
        </div>

        <!-- Main Content - Two Panel Layout -->
        <div class="modal-body">
          <!-- Left Panel: Form -->
          <div class="auth-panel">
            <div class="auth-notice" *ngIf="message">
              <p>{{ message }}</p>
            </div>

            <!-- Register Form -->
            <form *ngIf="!isLogin" (ngSubmit)="onRegister()" class="auth-form">
              <h3 class="form-title">Create Your Account</h3>

              <!-- Google Sign-in Button (Prominent) -->
              <button
                type="button"
                class="google-signin-btn"
                (click)="onGoogleSignIn()"
                [disabled]="isLoading"
              >
                <span *ngIf="!isLoading"
                  ><img
                    src="/assets/icons/Google_Favicon_2025.svg.png"
                    alt="Google G Logo"
                    class="benefit-icon"
                    style="width: 16px;"
                  />
                  Sign up with Google</span
                >
                <span *ngIf="isLoading" class="spinner"></span>
              </button>

              <!-- Divider -->
              <div class="auth-divider">
                <span>or sign up with a username</span>
              </div>

              <!-- Parental Assurance - Prominent -->
              <div class="parental-assurance">
                <div class="assurance-content">
                  <span class="assurance-emoji">🛡️</span>
                  <div class="assurance-text">
                    <strong>Privacy-first, no personal data needed</strong>
                    <p>Safe for kids, no ads or spam, email is optional</p>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="username">Username</label>
                <input
                  type="text"
                  id="username"
                  [(ngModel)]="registerData.username"
                  name="username"
                  required
                  placeholder="Choose a username (3-20 characters)"
                />
              </div>

              <div class="form-group">
                <label for="reg-email">Email (Optional)</label>
                <input
                  type="email"
                  id="reg-email"
                  [(ngModel)]="registerData.email"
                  name="email"
                  placeholder="Enter your email (optional)"
                />
              </div>

              <div class="form-group">
                <label for="reg-password">Password</label>
                <input
                  type="password"
                  id="reg-password"
                  [(ngModel)]="registerData.password"
                  name="password"
                  required
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              <div class="error-message" *ngIf="error">
                {{ error }}
              </div>

              <button
                type="submit"
                class="submit-btn"
                [disabled]="
                  isLoading || !registerData.username || !registerData.password
                "
              >
                <span *ngIf="!isLoading">Create Account</span>
                <span *ngIf="isLoading" class="spinner"></span>
              </button>

              <div class="auth-switch">
                <p>
                  Already have an account?
                  <button
                    type="button"
                    class="link-btn"
                    (click)="switchToLogin()"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>

            <!-- Login Form -->
            <form *ngIf="isLogin" (ngSubmit)="onLogin()" class="auth-form">
              <h3 class="form-title">Sign In to Continue</h3>

              <!-- Google Sign-in Button (Prominent) -->
              <button
                type="button"
                class="google-signin-btn"
                (click)="onGoogleSignIn()"
                [disabled]="isLoading"
              >
                <span *ngIf="!isLoading">
                  <img
                    src="/assets/icons/Google_Favicon_2025.svg.png"
                    alt="Google G Logo"
                    class="benefit-icon"
                    style="width: 16px;"
                  />
                  Sign in with Google</span
                >
                <span *ngIf="isLoading" class="spinner"></span>
              </button>

              <!-- Divider -->
              <div class="auth-divider">
                <span>or sign in with your account</span>
              </div>

              <div class="form-group">
                <label for="email">Email or Username</label>
                <input
                  type="text"
                  id="email"
                  [(ngModel)]="credentials.loginField"
                  name="email"
                  required
                  placeholder="Enter your email or username"
                />
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input
                  type="password"
                  id="password"
                  [(ngModel)]="credentials.password"
                  name="password"
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div class="error-message" *ngIf="error">
                {{ error }}
              </div>

              <button
                type="submit"
                class="submit-btn"
                [disabled]="
                  isLoading || !credentials.loginField || !credentials.password
                "
              >
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading" class="spinner"></span>
              </button>

              <div class="auth-switch">
                <p>
                  Don't have an account?
                  <button
                    type="button"
                    class="link-btn"
                    (click)="switchToRegister()"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>

          <!-- Right Panel: Benefits -->
          <div class="benefits-panel">
            <h3 class="benefits-title">Your Advantages:</h3>
            <div class="benefits-list">
              <!-- Update these benefits as needed - they're easy to modify! -->
              <div class="benefit-item">
                <span class="benefit-emoji">💾</span>
                <span class="benefit-text"
                  >Save your creations and access them anywhere</span
                >
              </div>
              <div class="benefit-item">
                <span class="benefit-emoji">🎨</span>
                <span class="benefit-text">Edit and improve your apps</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-emoji">🎁</span>
                <span class="benefit-text"
                  >+100 free tokens to build more!</span
                >
              </div>
              <div class="benefit-item">
                <span class="benefit-emoji">👨‍👩‍👧</span>
                <span class="benefit-text">Share the apps you created</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-emoji">🎤</span>
                <span class="benefit-text">Activate voice recognition</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-emoji">⭐</span>
                <span class="benefit-text"
                  >Rate and discover games made by others</span
                >
              </div>
              <div class="benefit-item">
                <img
                  src="/assets/icons/Google_Favicon_2025.svg.png"
                  alt="Google G Logo"
                  class="benefit-icon"
                  style="width: 16px;"
                />
                <span class="benefit-text">
                  Sign up with Google or with a username
                </span>
              </div>
              <div class="benefit-item">
                <span class="benefit-emoji">📱</span>
                <span class="benefit-text"
                  >Use your account across devices (web, Android, iOS coming
                  soon!)</span
                >
              </div>
            </div>
          </div>
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
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; // Reduced z-index to not interfere with OAuth popups
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease-out;
      }

      .modal-content {
        background: white;
        border-radius: 20px;
        width: 95%;
        max-width: 1000px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        animation: slideUp 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 2.5rem 1rem;
        border-bottom: 1px solid #f0f0f0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px 20px 0 0;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .emoji {
        font-size: 1.5rem;
      }

      .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        color: white;
        font-size: 1.2rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        min-height: 500px;
      }

      /* Left Panel - Auth Form */
      .auth-panel {
        padding: 2.5rem;
        background: white;
        border-radius: 0 0 0 20px;
      }

      .auth-notice {
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border: 1px solid #ffeaa7;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 2rem;
        color: #856404;
        text-align: center;
        font-weight: 500;
      }

      .auth-notice p {
        margin: 0;
        font-size: 0.95rem;
      }

      .auth-form {
        max-width: 100%;
      }

      .form-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
        margin: 0 0 1.5rem 0;
        text-align: center;
      }

      /* Google Sign-in Button */
      .google-signin-btn {
        width: 100%;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        box-shadow: 0 4px 15px rgba(66, 133, 244, 0.3);
      }

      .google-signin-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(66, 133, 244, 0.4);
      }

      .google-signin-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .google-icon {
        font-size: 1.25rem;
      }

      /* Auth Divider */
      .auth-divider {
        text-align: center;
        margin: 1.5rem 0;
        position: relative;
      }

      .auth-divider::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e8e8e8;
        z-index: 1;
      }

      .auth-divider span {
        background: white;
        color: #888;
        padding: 0 1rem;
        font-size: 0.9rem;
        font-weight: 500;
        position: relative;
        z-index: 2;
      }

      /* Parental Assurance Section */
      .parental-assurance {
        background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
        border: 2px solid #90ee90;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      .assurance-content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .assurance-emoji {
        font-size: 1.5rem;
        flex-shrink: 0;
        margin-top: 0.1rem;
      }

      .assurance-text {
        flex: 1;
      }

      .assurance-text strong {
        display: block;
        color: #2d5a2d;
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
      }

      .assurance-text p {
        margin: 0;
        color: #4a7c4a;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #555;
        font-size: 0.95rem;
      }

      .form-group input {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e8e8e8;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-sizing: border-box;
        background: #fafafa;
      }

      .form-group input:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        transform: translateY(-1px);
      }

      .form-group input::placeholder {
        color: #aaa;
        font-size: 0.9rem;
      }

      .error-message {
        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        border: 1px solid #f5c6cb;
        border-radius: 12px;
        color: #721c24;
        padding: 1rem;
        margin-bottom: 1.5rem;
        text-align: center;
        font-weight: 500;
        font-size: 0.9rem;
      }

      .submit-btn {
        width: 100%;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
        position: relative;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .submit-btn:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }

      .spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .auth-switch {
        text-align: center;
        margin-top: 1rem;
      }

      .auth-switch p {
        margin: 0;
        color: #666;
        font-size: 0.95rem;
      }

      .link-btn {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        text-decoration: underline;
        font-size: inherit;
        font-weight: 600;
        padding: 0;
        margin-left: 4px;
        transition: color 0.2s ease;
      }

      .link-btn:hover {
        color: #764ba2;
      }

      /* Right Panel - Benefits */
      .benefits-panel {
        background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
        padding: 2.5rem;
        border-radius: 0 0 20px 0;
        border-left: 1px solid #e8e8e8;
      }

      .benefits-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
        margin: 0 0 1.5rem 0;
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .benefits-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .benefit-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        border: 1px solid #f0f0f0;
      }

      .benefit-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .benefit-emoji {
        font-size: 1.5rem;
        flex-shrink: 0;
        margin-top: 0.2rem;
      }

      .benefit-text {
        color: #555;
        font-size: 0.95rem;
        line-height: 1.4;
        font-weight: 500;
      }

      /* Animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .modal-content {
          width: 98%;
          max-height: 95vh;
          border-radius: 16px;
        }

        .modal-header {
          padding: 1.5rem 1.5rem 1rem;
          border-radius: 16px 16px 0 0;
        }

        .modal-header h2 {
          font-size: 1.4rem;
        }

        .modal-body {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .auth-panel {
          padding: 1.5rem;
          border-radius: 0;
          order: 1;
        }

        .benefits-panel {
          padding: 1.5rem;
          border-radius: 0 0 16px 16px;
          border-left: none;
          border-top: 1px solid #e8e8e8;
          order: 2;
        }

        .benefits-title {
          font-size: 1.3rem;
          margin-bottom: 1rem;
        }

        .benefit-item {
          padding: 0.75rem;
          gap: 0.75rem;
        }

        .benefit-emoji {
          font-size: 1.25rem;
        }

        .benefit-text {
          font-size: 0.9rem;
        }

        .parental-assurance {
          padding: 0.75rem;
        }

        .assurance-content {
          gap: 0.5rem;
        }

        .assurance-emoji {
          font-size: 1.25rem;
        }

        .assurance-text strong {
          font-size: 0.9rem;
        }

        .assurance-text p {
          font-size: 0.8rem;
        }
      }

      @media (max-width: 480px) {
        .modal-header {
          padding: 1rem;
        }

        .modal-header h2 {
          font-size: 1.2rem;
        }

        .auth-panel,
        .benefits-panel {
          padding: 1rem;
        }

        .form-title {
          font-size: 1.3rem;
        }

        .benefits-title {
          font-size: 1.2rem;
        }
      }
    `,
  ],
})
export class AuthModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() message = "";
  @Input() isLogin = false; // Start with registration form
  @Output() closeModal = new EventEmitter<void>();
  @Output() authSuccess = new EventEmitter<any>();

  isLoading = false;
  error = "";

  credentials = {
    loginField: "",
    password: "",
  };

  registerData = {
    username: "",
    email: "",
    password: "",
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Reset form when modal opens
    if (this.isOpen) {
      this.resetForms();
    }
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

  onGoogleSignIn(): void {
    this.isLoading = true;
    this.error = "";

    // Temporarily hide the modal to prevent z-index conflicts with OAuth popup
    const originalIsOpen = this.isOpen;
    this.isOpen = false;

    this.authService.googleSignIn().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authSuccess.emit(response.user);
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;
        // Restore modal visibility on error
        this.isOpen = originalIsOpen;
        this.error =
          error.message || "Google sign-in failed. Please try again.";
      },
    });
  }

  onLogin(): void {
    if (!this.credentials.loginField || !this.credentials.password) {
      this.error = "Please fill in all required fields.";
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
        this.error = error.error?.message || "Login failed. Please try again.";
      },
    });
  }

  onRegister(): void {
    if (!this.registerData.username || !this.registerData.password) {
      this.error = "Please fill in all required fields.";
      return;
    }

    this.isLoading = true;
    this.error = "";

    // Prepare registration data with username as name
    const registrationData = {
      username: this.registerData.username,
      password: this.registerData.password,
      name: this.registerData.username, // Use username as name
      ...(this.registerData.email && { email: this.registerData.email }), // Only include email if provided
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authSuccess.emit(response.user);
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;
        this.error =
          error.error?.message || "Registration failed. Please try again.";
      },
    });
  }

  private resetForms(): void {
    this.credentials = { loginField: "", password: "" };
    this.registerData = { username: "", email: "", password: "" };
    this.error = "";
    this.isLoading = false;
    this.isLogin = false; // Start with registration form
  }
}
