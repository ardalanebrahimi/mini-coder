import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-privacy-policy",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <div class="legal-content">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: {{ lastUpdated }}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Mini Coder ("we", "our", or "us") is committed to protecting the
            privacy of our users, especially children. This Privacy Policy
            explains how we collect, use, and protect information when you use
            our service.
          </p>
        </section>

        <section>
          <h2>2. COPPA Compliance</h2>
          <p>
            We comply with the Children's Online Privacy Protection Act (COPPA)
            for users under 13 years old. We obtain verifiable parental consent
            before collecting personal information from children.
          </p>
          <p><strong>Parents' Rights:</strong></p>
          <ul>
            <li>Review their child's personal information</li>
            <li>Request deletion of their child's information</li>
            <li>Refuse further collection of their child's information</li>
            <li>Revoke consent at any time</li>
          </ul>
        </section>

        <section>
          <h2>3. Information We Collect</h2>
          <h3>From Children Under 13:</h3>
          <ul>
            <li>
              <strong>Account Information:</strong> Username, encrypted
              password
            </li>
            <li>
              <strong>Created Content:</strong> Apps, projects, and code they
              create
            </li>
            <li>
              <strong>Usage Data:</strong> Anonymized analytics (feature usage,
              session duration)
            </li>
          </ul>

          <h3>From Parents/Guardians:</h3>
          <ul>
            <li>Email address (for consent verification)</li>
            <li>Name (for consent records)</li>
          </ul>

          <h3>From Users 13 and Older:</h3>
          <ul>
            <li>Email address</li>
            <li>Username and password (encrypted)</li>
            <li>Profile information (optional)</li>
            <li>Created content</li>
            <li>Usage analytics</li>
          </ul>
        </section>

        <section>
          <h2>4. Information We Do NOT Collect from Children</h2>
          <ul>
            <li>Real names or contact information</li>
            <li>Precise geolocation</li>
            <li>Photos, videos, or audio recordings (except voice input for
commands, processed immediately and not stored)</li>
            <li>Social security numbers</li>
            <li>Persistent identifiers for advertising</li>
          </ul>
        </section>

        <section>
          <h2>5. How We Use Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and improve the Service</li>
            <li>Authenticate users and maintain accounts</li>
            <li>Save and display user-created apps</li>
            <li>Provide customer support</li>
            <li>Analyze usage patterns (anonymized)</li>
            <li>Ensure safety and security</li>
          </ul>
        </section>

        <section>
          <h2>6. Information Sharing</h2>
          <p>
            We do NOT sell, rent, or share personal information with third
            parties for marketing purposes.
          </p>
          <p>We may share information only:</p>
          <ul>
            <li>
              With service providers (hosting, analytics) under strict
              confidentiality agreements
            </li>
            <li>When required by law or legal process</li>
            <li>To protect our rights, safety, or property</li>
            <li>
              With parents/guardians of children under 13 upon verified request
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li>Encrypted passwords using bcrypt</li>
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure servers with access controls</li>
            <li>Regular security audits</li>
            <li>Limited employee access to personal data</li>
          </ul>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain personal information only as long as necessary to provide
            the Service or as required by law. Users may request deletion of
            their account and data at any time.
          </p>
        </section>

        <section>
          <h2>9. Cookies & Analytics</h2>
          <p>
            We use cookies and similar technologies for essential functionality
            and (with consent) analytics:
          </p>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Authentication, session
              management
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Anonymized usage data to
              improve the Service
            </li>
          </ul>
          <p>
            You can control cookie preferences through our cookie consent
            banner.
          </p>
        </section>

        <section>
          <h2>10. Your Rights (GDPR & CCPA)</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data (data portability)</li>
            <li>Opt-out of data processing</li>
            <li>Lodge a complaint with supervisory authorities</li>
          </ul>
          <p>
            To exercise these rights, contact us at
            <a href="mailto:privacy@minicoder.com">privacy&#64;minicoder.com</a
            >.
          </p>
        </section>

        <section>
          <h2>11. Third-Party Services</h2>
          <p>Mini Coder uses:</p>
          <ul>
            <li>
              <strong>OpenAI API:</strong> For AI-powered app generation (no
              personal data sent)
            </li>
            <li>
              <strong>Google OAuth:</strong> Optional sign-in (subject to
              Google's Privacy Policy)
            </li>
            <li>
              <strong>Azure:</strong> Hosting infrastructure with EU data
              centers
            </li>
          </ul>
          <p>
            We ensure all third-party services comply with COPPA and GDPR
            requirements.
          </p>
        </section>

        <section>
          <h2>12. International Data Transfers</h2>
          <p>
            Data is stored on servers located in the EU (Germany - West
            Central). Transfers outside the EU are protected by appropriate
            safeguards.
          </p>
        </section>

        <section>
          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            users of material changes via email or prominent notice on the
            Service.
          </p>
        </section>

        <section>
          <h2>14. Contact Us</h2>
          <p>For privacy-related questions or requests, contact:</p>
          <p>
            <strong>Email:</strong>
            <a href="mailto:privacy@minicoder.com">privacy&#64;minicoder.com</a
            ><br />
            <strong>Mail:</strong> [Your Company Address]<br />
            <strong>Data Protection Officer:</strong> [DPO Contact if
            applicable]
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

      h3 {
        color: #555;
        margin: 15px 0 10px;
        font-size: 1.1rem;
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

      strong {
        color: #333;
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
export class PrivacyPolicyComponent {
  lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
