import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-cookie-consent-banner",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cookie-banner" *ngIf="!hasConsent && showBanner">
      <div class="cookie-content">
        <div class="cookie-icon">🍪</div>
        <div class="cookie-text">
          <h3>We use cookies</h3>
          <p>
            We use essential cookies to make our site work. With your consent,
            we may also use analytics cookies to improve your experience. You
            can change your preferences at any time.
            <a href="/privacy" target="_blank">Learn more</a>
          </p>
        </div>
        <div class="cookie-actions">
          <button class="btn btn-primary" (click)="acceptAll()">
            Accept All
          </button>
          <button class="btn btn-secondary" (click)="acceptEssential()">
            Essential Only
          </button>
          <button class="btn btn-link" (click)="customize()">Customize</button>
        </div>
      </div>

      <!-- Customization Panel -->
      <div class="cookie-customize" *ngIf="showCustomize">
        <h4>Cookie Preferences</h4>
        <div class="cookie-option">
          <label>
            <input type="checkbox" checked disabled />
            <div class="option-info">
              <strong>Essential Cookies (Required)</strong>
              <p>
                These cookies are necessary for the website to function and
                cannot be turned off. They include authentication and security
                features.
              </p>
            </div>
          </label>
        </div>
        <div class="cookie-option">
          <label>
            <input
              type="checkbox"
              [(ngModel)]="analyticsConsent"
              [ngModelOptions]="{ standalone: true }"
            />
            <div class="option-info">
              <strong>Analytics Cookies (Optional)</strong>
              <p>
                These cookies help us understand how visitors interact with our
                website. All data is anonymized and cannot be used to identify
                you.
              </p>
            </div>
          </label>
        </div>
        <div class="customize-actions">
          <button class="btn btn-secondary" (click)="showCustomize = false">
            Cancel
          </button>
          <button class="btn btn-primary" (click)="savePreferences()">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }

      .cookie-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .cookie-icon {
        font-size: 3rem;
      }

      .cookie-text {
        flex: 1;
        min-width: 300px;
      }

      .cookie-text h3 {
        margin: 0 0 8px 0;
        font-size: 1.25rem;
        color: #333;
      }

      .cookie-text p {
        margin: 0;
        color: #666;
        line-height: 1.5;
      }

      .cookie-text a {
        color: #2196f3;
        text-decoration: underline;
      }

      .cookie-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .cookie-customize {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px 20px;
        border-top: 1px solid #e0e0e0;
        animation: expandDown 0.3s ease-out;
      }

      @keyframes expandDown {
        from {
          max-height: 0;
          opacity: 0;
        }
        to {
          max-height: 500px;
          opacity: 1;
        }
      }

      .cookie-customize h4 {
        margin: 15px 0;
        color: #333;
      }

      .cookie-option {
        margin-bottom: 15px;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .cookie-option label {
        display: flex;
        gap: 15px;
        cursor: pointer;
        align-items: flex-start;
      }

      .cookie-option input[type="checkbox"] {
        margin-top: 3px;
        cursor: pointer;
      }

      .cookie-option input[type="checkbox"]:disabled {
        cursor: not-allowed;
      }

      .option-info strong {
        display: block;
        margin-bottom: 5px;
        color: #333;
      }

      .option-info p {
        margin: 0;
        font-size: 0.875rem;
        color: #666;
      }

      .customize-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 15px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #2196f3;
        color: white;
      }

      .btn-primary:hover {
        background: #1976d2;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      .btn-secondary:hover {
        background: #d0d0d0;
      }

      .btn-link {
        background: transparent;
        color: #2196f3;
        text-decoration: underline;
      }

      .btn-link:hover {
        color: #1976d2;
      }

      @media (max-width: 768px) {
        .cookie-content {
          flex-direction: column;
          text-align: center;
        }

        .cookie-actions {
          width: 100%;
          justify-content: center;
        }

        .btn {
          flex: 1;
        }
      }
    `,
  ],
})
export class CookieConsentBannerComponent implements OnInit {
  hasConsent: boolean = false;
  showBanner: boolean = false;
  showCustomize: boolean = false;
  analyticsConsent: boolean = false;

  private readonly CONSENT_KEY = "cookieConsent";
  private readonly ANALYTICS_KEY = "analyticsConsent";

  ngOnInit(): void {
    // Check if user has already given consent
    const storedConsent = localStorage.getItem(this.CONSENT_KEY);
    const storedAnalytics = localStorage.getItem(this.ANALYTICS_KEY);

    if (storedConsent) {
      this.hasConsent = true;
      this.analyticsConsent = storedAnalytics === "true";
      this.applyConsent();
    } else {
      // Show banner after a short delay
      setTimeout(() => {
        this.showBanner = true;
      }, 1000);
    }
  }

  acceptAll(): void {
    this.analyticsConsent = true;
    this.saveConsentSettings();
  }

  acceptEssential(): void {
    this.analyticsConsent = false;
    this.saveConsentSettings();
  }

  customize(): void {
    this.showCustomize = !this.showCustomize;
  }

  savePreferences(): void {
    this.saveConsentSettings();
    this.showCustomize = false;
  }

  private saveConsentSettings(): void {
    localStorage.setItem(this.CONSENT_KEY, "true");
    localStorage.setItem(
      this.ANALYTICS_KEY,
      this.analyticsConsent.toString()
    );
    this.hasConsent = true;
    this.applyConsent();
  }

  private applyConsent(): void {
    // Dispatch event to notify analytics service
    window.dispatchEvent(
      new CustomEvent("cookieConsentChanged", {
        detail: {
          analyticsEnabled: this.analyticsConsent,
        },
      })
    );
  }

  // Public method to reset consent (for settings page)
  public resetConsent(): void {
    localStorage.removeItem(this.CONSENT_KEY);
    localStorage.removeItem(this.ANALYTICS_KEY);
    this.hasConsent = false;
    this.showBanner = true;
    this.analyticsConsent = false;
  }
}
