import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { AppSharingService } from "../services/app-sharing.service";

@Component({
  selector: "app-shared-preview",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shared-preview-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading shared app...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-content">
          <span class="emoji">❌</span>
          <h2>App Not Found</h2>
          <p>{{ error }}</p>
          <a href="/" class="home-link">
            <span class="emoji">🏠</span>
            Go to MiniCoder
          </a>
        </div>
      </div>

      <!-- App Preview -->
      <div *ngIf="sharedApp && !loading && !error" class="app-preview">
        <!-- Watermarked App Display -->
        <div class="app-container">
          <iframe
            [src]="getSafeAppUrl()"
            class="app-frame"
            [title]="sharedApp.projectName + ' - Shared App'"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation"
          >
          </iframe>
        </div>

        <!-- Copyright Footer (Always visible) -->
        <div class="shared-footer">
          <div class="app-info">
            <h1>{{ sharedApp.projectName }}</h1>
            <p class="creator-info">
              Created by <strong>{{ sharedApp.creatorUsername }}</strong>
            </p>
          </div>
          <div class="branding">
            <a href="/" target="_blank" class="minicoder-link">
              <span class="emoji">🚀</span>
              <span>Create your own app with MiniCoder</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./shared-preview.component.scss"],
})
export class SharedPreviewComponent implements OnInit {
  shareId: number | null = null;
  sharedApp: any = null;
  loading = true;
  error: string | null = null;
  appBlobUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private appSharingService: AppSharingService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.shareId = Number(params.get("shareId"));
      if (this.shareId) {
        await this.loadSharedApp(this.shareId);
      } else {
        this.error = "Invalid share link. Please check the URL and try again.";
        this.loading = false;
      }
    });
  }

  loadSharedApp = async (shareId: number) => {
    try {
      this.loading = true;
      this.error = null;

      // Get shared app data from the service
      const sharedApp = await this.appSharingService.getSharedApp(shareId);

      if (!sharedApp) {
        this.error =
          "This shared app is no longer available or the link is invalid.";
        this.loading = false;
        return;
      }

      this.sharedApp = sharedApp;

      // Add watermark to the app HTML for display
      const watermarkedHtml = this.addWatermarkToApp(
        this.sharedApp.code,
        this.sharedApp.name,
        this.sharedApp.user?.username
      );

      // Create blob URL for iframe display
      const blob = new Blob([watermarkedHtml], { type: "text/html" });
      this.appBlobUrl = URL.createObjectURL(blob);

      this.loading = false;
    } catch (error) {
      console.error("Error loading shared app:", error);
      this.error = "Failed to load the shared app. Please try again later.";
      this.loading = false;
    }
  };

  getSafeAppUrl(): SafeUrl {
    if (this.appBlobUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.appBlobUrl);
    }
    return "";
  }

  /**
   * Add watermark to app HTML (similar to the service method)
   */
  private addWatermarkToApp(
    originalHtml: string,
    appName: string,
    creatorUsername: string
  ): string {
    const copyrightStyles = `
      <style id="minicoder-copyright-styles">
        .minicoder-copyright {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          font-size: 12px;
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
        
        .minicoder-copyright a {
          color: #4CAF50;
          text-decoration: none;
        }
        
        .minicoder-copyright a:hover {
          text-decoration: underline;
        }
        
        body {
          padding-bottom: 40px !important;
          box-sizing: border-box;
        }
        
        @media (max-width: 480px) {
          .minicoder-copyright {
            font-size: 11px;
            padding: 6px 12px;
          }
          
          body {
            padding-bottom: 35px !important;
          }
        }
      </style>`;

    const copyrightHtml = `
      <div class="minicoder-copyright" id="minicoder-copyright">
        © ${new Date().getFullYear()} ${this.escapeHtml(
      appName
    )} by ${this.escapeHtml(creatorUsername)} | 
        <a href="${
          window.location.origin
        }" target="_blank">Created with MiniCoder</a>
      </div>`;

    let modifiedHtml = originalHtml;

    // Add styles to head
    if (modifiedHtml.includes("</head>")) {
      modifiedHtml = modifiedHtml.replace(
        "</head>",
        `${copyrightStyles}</head>`
      );
    } else {
      modifiedHtml = `<head>${copyrightStyles}</head>${modifiedHtml}`;
    }

    // Add copyright HTML before closing body tag
    if (modifiedHtml.includes("</body>")) {
      modifiedHtml = modifiedHtml.replace("</body>", `${copyrightHtml}</body>`);
    } else {
      modifiedHtml = `${modifiedHtml}${copyrightHtml}`;
    }

    // Ensure proper HTML structure
    if (!modifiedHtml.includes("<!DOCTYPE html>")) {
      modifiedHtml = `<!DOCTYPE html><html>${modifiedHtml}</html>`;
    }

    return modifiedHtml;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  ngOnDestroy() {
    // Clean up blob URL
    if (this.appBlobUrl) {
      URL.revokeObjectURL(this.appBlobUrl);
    }
  }
}
