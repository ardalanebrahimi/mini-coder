import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

export interface ParentalConsentData {
  parentEmail: string;
  parentName: string;
  childAge: number;
  consent: boolean;
  timestamp: string;
}

@Component({
  selector: "app-parental-consent-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>👨‍👩‍👧 Parental Consent Required</h2>
          <button class="close-btn" (click)="onClose()" aria-label="Close">
            ×
          </button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <p>
              <strong>For children under 13:</strong> We need parental consent
              to create an account under COPPA (Children's Online Privacy
              Protection Act) regulations.
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" #consentForm="ngForm">
            <!-- Child's Age -->
            <div class="form-group">
              <label for="childAge"
                >Child's Age <span class="required">*</span></label
              >
              <input
                type="number"
                id="childAge"
                name="childAge"
                [(ngModel)]="childAge"
                min="1"
                max="17"
                required
                class="form-control"
                placeholder="Enter age"
              />
              <small class="form-hint"
                >Users under 13 require parental consent</small
              >
            </div>

            <!-- Show parental consent fields if child is under 13 -->
            <div *ngIf="childAge && childAge < 13" class="consent-section">
              <h3>Parent/Guardian Information</h3>

              <div class="form-group">
                <label for="parentName"
                  >Parent/Guardian Name <span class="required">*</span></label
                >
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  [(ngModel)]="parentName"
                  required
                  class="form-control"
                  placeholder="Full name"
                />
              </div>

              <div class="form-group">
                <label for="parentEmail"
                  >Parent/Guardian Email <span class="required">*</span></label
                >
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  [(ngModel)]="parentEmail"
                  required
                  class="form-control"
                  placeholder="parent@example.com"
                />
                <small class="form-hint"
                  >We'll send a verification email to confirm consent</small
                >
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    name="consentCheckbox"
                    [(ngModel)]="consentGiven"
                    required
                  />
                  <span class="checkbox-text">
                    I am the parent/legal guardian and I consent to my child
                    using Mini Coder. I have read and agree to the
                    <a href="/terms" target="_blank">Terms of Service</a> and
                    <a href="/privacy" target="_blank">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <div class="info-box warning">
                <strong>What we collect:</strong>
                <ul>
                  <li>Username and password (encrypted)</li>
                  <li>Created apps and projects</li>
                  <li>Basic usage analytics (anonymized)</li>
                </ul>
                <strong>What we DON'T collect:</strong>
                <ul>
                  <li>Personal contact information from children</li>
                  <li>Location data</li>
                  <li>Photos or videos</li>
                </ul>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="onClose()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!consentForm.form.valid || isProcessing"
              >
                {{ isProcessing ? "Processing..." : "Continue" }}
              </button>
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
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
      }

      .close-btn:hover {
        color: #333;
      }

      .modal-body {
        padding: 20px;
      }

      .info-box {
        background: #e3f2fd;
        border-left: 4px solid #2196f3;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 4px;
      }

      .info-box.warning {
        background: #fff3e0;
        border-left-color: #ff9800;
      }

      .info-box ul {
        margin: 8px 0;
        padding-left: 20px;
      }

      .info-box li {
        margin: 4px 0;
      }

      .consent-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
      }

      .consent-section h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
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

      .required {
        color: #f44336;
      }

      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
        box-sizing: border-box;
      }

      .form-control:focus {
        outline: none;
        border-color: #2196f3;
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
      }

      .form-hint {
        display: block;
        margin-top: 5px;
        font-size: 0.875rem;
        color: #666;
      }

      .checkbox-group {
        margin-top: 20px;
      }

      .checkbox-label {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
      }

      .checkbox-label input[type="checkbox"] {
        margin-right: 10px;
        margin-top: 3px;
        cursor: pointer;
      }

      .checkbox-text {
        line-height: 1.5;
      }

      .checkbox-text a {
        color: #2196f3;
        text-decoration: underline;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
      }

      .btn {
        padding: 10px 24px;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #d0d0d0;
      }

      .btn-primary {
        background: #2196f3;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #1976d2;
      }
    `,
  ],
})
export class ParentalConsentModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() consentGiven = new EventEmitter<ParentalConsentData>();

  childAge: number | null = null;
  parentName: string = "";
  parentEmail: string = "";
  consentGiven: boolean = false;
  isProcessing: boolean = false;

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.childAge === null) {
      return;
    }

    // If child is 13 or older, no parental consent needed
    if (this.childAge >= 13) {
      this.consentGiven.emit({
        parentEmail: "",
        parentName: "",
        childAge: this.childAge,
        consent: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // For children under 13, validate parental info
    if (!this.parentName || !this.parentEmail || !this.consentGiven) {
      return;
    }

    this.isProcessing = true;

    // Emit consent data
    this.consentGiven.emit({
      parentEmail: this.parentEmail,
      parentName: this.parentName,
      childAge: this.childAge,
      consent: true,
      timestamp: new Date().toISOString(),
    });
  }
}
