import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { ProcessedCommand } from "./prompt-processor.service";
import { AuthService } from "./auth.service";
import { AnalyticsService, AnalyticsEventType } from "./analytics.service";
import { AppStoreService, PublishedProject } from "./app-store.service";
import { TranslationService } from "./translation.service";

export interface ShareableApp {
  id?: number;
  appHtml: string;
  appName: string;
  creatorUsername: string;
  creatorName?: string;
  language: string;
  createdAt: Date;
  shareUrl: string;
  previewUrl: string;
  shareText: string;
}

export interface AppSharingData {
  isOpen: boolean;
  currentApp?: ProcessedCommand;
  shareableApp?: ShareableApp;
  shareUrl?: string;
  shareText?: string;
  isGenerating?: boolean;
  error?: string;
}

@Injectable({
  providedIn: "root",
})
export class AppSharingService {
  private sharingDataSubject = new BehaviorSubject<AppSharingData>({
    isOpen: false,
  });

  sharingData$ = this.sharingDataSubject.asObservable();

  constructor(
    private authService: AuthService,
    private analytics: AnalyticsService,
    private appStoreService: AppStoreService,
    private translationService: TranslationService
  ) {}

  /**
   * Get current user from auth service
   */
  private getCurrentUser(): any {
    let currentUser = null;
    this.authService.currentUser$
      .subscribe((user) => {
        currentUser = user;
      })
      .unsubscribe();
    return currentUser;
  }

  /**
   * Open sharing modal for an app
   */
  openSharingModal(app: ProcessedCommand): void {
    // Check if the app has been saved (has an ID)
    if (!app.id) {
      this.sharingDataSubject.next({
        isOpen: true,
        currentApp: app,
        isGenerating: false,
        error:
          this.translationService.t("sharing.saveFirst") ||
          "Please save your app first before sharing. Apps must be saved to generate shareable links.",
      });
      return;
    }

    this.sharingDataSubject.next({
      isOpen: true,
      currentApp: app,
      isGenerating: true,
    });

    this.generateShareableApp(app);
  }

  /**
   * Close sharing modal
   */
  closeSharingModal(): void {
    this.sharingDataSubject.next({
      isOpen: false,
    });
  }

  /**
   * Generate a shareable app with route-based sharing
   */
  private async generateShareableApp(app: ProcessedCommand): Promise<void> {
    try {
      // Get current user from localStorage or service
      const currentUser = this.getCurrentUser();
      //   const shareId = this.generateShareId();

      // Store the app data for the shareable route
      //   await this.storeSharedApp(shareId, app, currentUser);

      // Generate route-based share URL
      const shareUrl = this.generateShareUrl(app.id);
      const previewUrl = shareUrl; // Same URL for preview and sharing

      const shareableApp: ShareableApp = {
        id: app.id,
        appHtml: app.generatedCode, // Store original HTML without watermark for sharing
        appName: app.projectName || "Untitled App",
        creatorUsername: currentUser?.username || "Anonymous",
        creatorName: currentUser?.name,
        language: app.detectedLanguage || "html",
        createdAt: new Date(),
        shareUrl,
        previewUrl,
        shareText: `Check out "${
          app.projectName || "my app"
        }" created with MiniCoder! 🚀`,
      };

      // Update sharing data
      this.sharingDataSubject.next({
        isOpen: true,
        currentApp: app,
        shareableApp,
        shareUrl,
        isGenerating: false,
      });

      // Log sharing event
      this.analytics.logEvent(AnalyticsEventType.APP_SHARED, {
        appShared: {
          appName: shareableApp.appName,
          language: shareableApp.language,
          shareMethod: "link",
          userType: currentUser ? "logged_in" : "guest",
        },
      });
    } catch (error) {
      console.error("Error generating shareable app:", error);
      this.sharingDataSubject.next({
        isOpen: true,
        currentApp: app,
        isGenerating: false,
        error: "Failed to generate shareable app. Please try again.",
      });
    }
  }

  /**
   * Get shared app data by ID (for the shared route)
   */
  async getSharedApp(shareId: number): Promise<PublishedProject | null> {
    try {
      let result: PublishedProject | null = null;
      await new Promise<void>((resolve) => {
        this.appStoreService.getPublicProject(shareId).subscribe({
          next: (data) => {
            result = data;
            resolve();
          },
          error: (err) => {
            console.error("Error retrieving shared app:", err);
            result = null;
            resolve();
          },
        });
      });
      return result;
    } catch (error) {
      console.error("Error retrieving shared app:", error);
      return null;
    }
  }

  /**
   * Add copyright footer to the app HTML
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
        
        /* Adjust body padding to accommodate copyright */
        body {
          padding-bottom: 40px !important;
          box-sizing: border-box;
        }
        
        /* Responsive design */
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

    // Insert copyright styles and HTML into the original HTML
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

  /**
   * Generate share URL for route-based sharing
   */
  private generateShareUrl(shareId?: number): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${shareId}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Copy share URL to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  }

  /**
   * Download the watermarked app as an HTML file
   */
  downloadApp(shareableApp: ShareableApp): void {
    const blob = new Blob([shareableApp.appHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shareableApp.appName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_minicoder.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log download event
    this.analytics.logEvent(AnalyticsEventType.APP_SHARED, {
      appShared: {
        appName: shareableApp.appName,
        language: shareableApp.language,
        shareMethod: "download",
        userType: this.authService.isLoggedIn() ? "logged_in" : "guest",
      },
    });
  }

  /**
   * Get current sharing data
   */
  getCurrentSharingData(): AppSharingData {
    return this.sharingDataSubject.value;
  }
}
