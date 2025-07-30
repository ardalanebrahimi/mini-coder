import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a
            href="/assets/legal/privacy-policy.html"
            target="_blank"
            class="footer-link"
          >
            Privacy Policy
          </a>
          <span class="separator">|</span>
          <a
            href="/assets/legal/datenschutz.html"
            target="_blank"
            class="footer-link"
          >
            Datenschutz
          </a>
          <span class="separator">|</span>
          <a
            href="/assets/legal/legal-notice.html"
            target="_blank"
            class="footer-link"
          >
            Legal Notice
          </a>
          <span class="separator">|</span>
          <a
            href="/assets/legal/impressum.html"
            target="_blank"
            class="footer-link"
          >
            Impressum
          </a>
        </div>
        <div class="footer-text">
          <span class="app-name">MiniCoder</span>
          <span class="year">© 2025</span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        padding: 20px 0;
        margin-top: auto;
        font-size: 0.85rem;
        color: #6c757d;
      }

      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .footer-links {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .footer-link {
        color: #667eea;
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .footer-link:hover {
        color: #5a6fd8;
        background: rgba(102, 126, 234, 0.1);
        text-decoration: underline;
      }

      .separator {
        color: #dee2e6;
        font-weight: 300;
      }

      .footer-text {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.8rem;
      }

      .app-name {
        font-weight: 600;
        color: #495057;
      }

      .year {
        color: #6c757d;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .footer-content {
          padding: 0 15px;
        }

        .footer-links {
          flex-direction: column;
          gap: 5px;
        }

        .separator {
          display: none;
        }

        .footer-text {
          flex-direction: column;
          gap: 5px;
          text-align: center;
        }
      }
    `,
  ],
})
export class FooterComponent {}
