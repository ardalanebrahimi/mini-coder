import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-terms-of-service",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <div class="legal-content">
        <h1>Terms of Service</h1>
        <p class="last-updated">Last Updated: {{ lastUpdated }}</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Mini Coder ("the Service"), you agree to be
            bound by these Terms of Service. If you do not agree to these
            terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. Age Requirements & Parental Consent</h2>
          <p>
            Mini Coder is designed for children aged 7-12. Users under 13 years
            of age must have verifiable parental consent to use the Service in
            compliance with COPPA (Children's Online Privacy Protection Act).
          </p>
          <p>
            Parents or legal guardians of users under 13 must provide consent
            and may review, update, or delete their child's information at any
            time.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring information provided is accurate and current</li>
          </ul>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Create or share inappropriate content</li>
            <li>Harass, bully, or harm other users</li>
            <li>Attempt to hack or disrupt the Service</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Share personal information publicly</li>
            <li>Impersonate others or misrepresent your identity</li>
          </ul>
        </section>

        <section>
          <h2>5. Content Ownership</h2>
          <p>
            You retain ownership of the apps and content you create using Mini
            Coder. By publishing content to the App Store, you grant us a
            license to display and distribute that content within the Service.
          </p>
          <p>
            Mini Coder uses AI to generate code. While you own the apps you
            create, you acknowledge that AI-generated content may not be
            entirely unique.
          </p>
        </section>

        <section>
          <h2>6. Token System & Payments</h2>
          <p>
            Mini Coder uses a token-based system for AI-powered features. Token
            purchases are:
          </p>
          <ul>
            <li>Non-refundable except as required by law</li>
            <li>Subject to our pricing at the time of purchase</li>
            <li>Valid for your account only and non-transferable</li>
          </ul>
        </section>

        <section>
          <h2>7. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these
            Terms. You may delete your account at any time through your profile
            settings.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "AS IS" without warranties of any kind. We
            do not guarantee that the Service will be uninterrupted, secure, or
            error-free.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Mini Coder shall not be
            liable for any indirect, incidental, or consequential damages
            arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>11. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us at:
            <a href="mailto:support@minicoder.com">support&#64;minicoder.com</a>
          </p>
        </section>

        <div class="back-link">
          <a routerLink="/landing">← Back to Home</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .legal-container {
        min-height: 100vh;
        background: #f8f9fa;
        padding: 40px 20px;
      }

      .legal-content {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #333;
        margin-bottom: 10px;
      }

      .last-updated {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 30px;
      }

      section {
        margin-bottom: 30px;
      }

      h2 {
        color: #2196f3;
        margin-bottom: 15px;
        font-size: 1.25rem;
      }

      p {
        line-height: 1.6;
        color: #555;
        margin-bottom: 10px;
      }

      ul {
        margin: 10px 0;
        padding-left: 25px;
      }

      li {
        margin-bottom: 8px;
        line-height: 1.6;
        color: #555;
      }

      a {
        color: #2196f3;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      .back-link {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 768px) {
        .legal-content {
          padding: 20px;
        }

        h1 {
          font-size: 1.5rem;
        }
      }
    `,
  ],
})
export class TermsOfServiceComponent {
  lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
