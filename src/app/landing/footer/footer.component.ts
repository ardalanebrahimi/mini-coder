import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="brand-section">
              <h3 class="brand-title">Mini Coder</h3>
              <span class="brand-icon">🚀</span>
            </div>
            <p class="brand-description">
              Empowering young minds to create amazing games and tools with AI
              magic!
            </p>
          </div>

          <div class="footer-links">
            <div class="link-column">
              <h4 class="column-title">Platform</h4>
              <ul class="link-list">
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#safety">Safety</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>

            <div class="link-column">
              <h4 class="column-title">Community</h4>
              <ul class="link-list">
                <li><a href="#gallery">App Gallery</a></li>
                <li><a href="#showcases">Showcases</a></li>
                <li><a href="#tutorials">Tutorials</a></li>
                <li><a href="#events">Events</a></li>
              </ul>
            </div>

            <div class="link-column">
              <h4 class="column-title">Support</h4>
              <ul class="link-list">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="copyright">
            © 2025 MiniCoder. Made with ❤️ for young creators everywhere.
          </p>
          <div class="social-links">
            <span>🌟 Safe</span>
            <span>🎨 Creative</span>
            <span>🚀 Fun</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent {}
