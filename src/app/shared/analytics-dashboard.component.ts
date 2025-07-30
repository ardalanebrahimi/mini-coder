import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import {
  AnalyticsService,
  AnalyticsEvent,
  AnalyticsEventType,
} from "../services/analytics.service";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-analytics-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-dashboard" *ngIf="showDashboard">
      <!-- Development/Admin Only Notice -->
      <div class="dev-notice" *ngIf="isDevelopmentMode">
        <small
          >⚠️ Development Mode - Dashboard will be disabled in production</small
        >
      </div>

      <!-- Dashboard Disabled Message -->
      <div class="dashboard-disabled" *ngIf="!isDashboardEnabled">
        <div class="disabled-content">
          <h2>📊 Analytics Dashboard</h2>
          <p>
            Dashboard is disabled in production for privacy and performance.
          </p>
          <p>Analytics events are being securely sent to the backend.</p>
          <button (click)="closeDashboard()" class="close-btn">Close</button>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <div class="dashboard-content" *ngIf="isDashboardEnabled">
        <div class="dashboard-header">
          <h2>📊 Analytics Dashboard</h2>
          <button (click)="closeDashboard()" class="close-btn">×</button>
        </div>

        <!-- Connection Status -->
        <div class="connection-status" [class.offline]="!stats.isOnline">
          <span *ngIf="stats.isOnline" class="online"
            >🟢 Online - Events syncing to backend</span
          >
          <span *ngIf="!stats.isOnline" class="offline"
            >🔴 Offline - Events buffered locally</span
          >
          <span *ngIf="stats.pendingSync > 0" class="pending">
            ({{ stats.pendingSync }} pending sync)</span
          >
        </div>

        <!-- Summary Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Events</h3>
            <p class="stat-number">{{ stats.totalEvents }}</p>
          </div>
          <div class="stat-card">
            <h3>Pending Sync</h3>
            <p class="stat-number pending-sync">{{ stats.pendingSync || 0 }}</p>
          </div>
          <div class="stat-card">
            <h3>Session Duration</h3>
            <p class="stat-number">
              {{ formatDuration(stats.sessionDuration) }}
            </p>
          </div>
          <div class="stat-card">
            <h3>Errors</h3>
            <p class="stat-number error-count">{{ stats.errorCount }}</p>
          </div>
        </div>

        <!-- Event Type Breakdown -->
        <div class="section">
          <h3>Event Types</h3>
          <div class="event-types">
            <div
              *ngFor="let eventType of getEventTypes()"
              class="event-type-row"
            >
              <span class="event-name">{{
                formatEventName(eventType.name)
              }}</span>
              <span class="event-count">{{ eventType.count }}</span>
            </div>
          </div>
        </div>

        <!-- Language Distribution -->
        <div class="section">
          <h3>Language Distribution</h3>
          <div class="language-chart">
            <div *ngFor="let lang of getLanguages()" class="language-row">
              <span class="language-name">{{ lang.name }}</span>
              <div class="language-bar">
                <div
                  class="language-fill"
                  [style.width.%]="lang.percentage"
                ></div>
              </div>
              <span class="language-count">{{ lang.count }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Events -->
        <div class="section">
          <h3>Recent Events (Last 10)</h3>
          <div class="recent-events">
            <div *ngFor="let event of getRecentEvents()" class="event-row">
              <span class="event-time">{{ formatTime(event.timestamp) }}</span>
              <span class="event-type">{{
                formatEventName(event.eventType)
              }}</span>
              <span class="event-details">{{ getEventDetails(event) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="dashboard-actions">
          <button (click)="exportData()" class="action-btn">
            📁 Export Data
          </button>
          <button (click)="clearData()" class="action-btn danger">
            🗑️ Clear Data
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .analytics-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        overflow-y: auto;
        padding: 20px;
      }

      .dashboard-header {
        background: white;
        padding: 15px 20px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0;
      }

      .dashboard-header h2 {
        margin: 0;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }

      .close-btn:hover {
        background: #f0f0f0;
      }

      .dashboard-content {
        background: white;
        padding: 20px;
        border-radius: 0 0 8px 8px;
        max-width: 800px;
        margin: 0 auto;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #e9ecef;
      }

      .stat-card h3 {
        margin: 0 0 10px 0;
        color: #666;
        font-size: 14px;
        font-weight: normal;
      }

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        margin: 0;
        color: #333;
      }

      .error-count {
        color: #dc3545;
      }

      .section {
        margin-bottom: 30px;
      }

      .section h3 {
        margin: 0 0 15px 0;
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 5px;
      }

      .event-types {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
      }

      .event-type-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e9ecef;
      }

      .event-type-row:last-child {
        border-bottom: none;
      }

      .event-name {
        color: #333;
      }

      .event-count {
        font-weight: bold;
        color: #007bff;
      }

      .language-chart {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
      }

      .language-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

      .language-name {
        width: 50px;
        font-size: 12px;
        color: #666;
      }

      .language-bar {
        flex: 1;
        height: 20px;
        background: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
      }

      .language-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #28a745);
        transition: width 0.3s ease;
      }

      .language-count {
        width: 30px;
        text-align: right;
        font-size: 12px;
        font-weight: bold;
        color: #333;
      }

      .recent-events {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        max-height: 300px;
        overflow-y: auto;
      }

      .event-row {
        display: grid;
        grid-template-columns: 80px 1fr 2fr;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #e9ecef;
        font-size: 12px;
      }

      .event-row:last-child {
        border-bottom: none;
      }

      .event-time {
        color: #666;
      }

      .event-type {
        font-weight: bold;
        color: #007bff;
      }

      .event-details {
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dashboard-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e9ecef;
      }

      .action-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
      }

      .action-btn:not(.danger) {
        background: #007bff;
        color: white;
      }

      .action-btn:not(.danger):hover {
        background: #0056b3;
      }

      .action-btn.danger {
        background: #dc3545;
        color: white;
      }

      .action-btn.danger:hover {
        background: #c82333;
      }

      /* New styles for backend sync UI */
      .dev-notice {
        background: #fff3cd;
        color: #856404;
        padding: 8px 15px;
        border-radius: 4px;
        margin-bottom: 10px;
        text-align: center;
        border: 1px solid #ffeaa7;
      }

      .dashboard-disabled {
        background: white;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        max-width: 500px;
        margin: 50px auto;
      }

      .dashboard-disabled h2 {
        margin: 0 0 20px 0;
        color: #333;
      }

      .dashboard-disabled p {
        margin: 0 0 15px 0;
        color: #666;
        line-height: 1.5;
      }

      .connection-status {
        background: #d4edda;
        color: #155724;
        padding: 10px 15px;
        border-radius: 4px;
        margin-bottom: 20px;
        border: 1px solid #c3e6cb;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .connection-status.offline {
        background: #f8d7da;
        color: #721c24;
        border-color: #f5c6cb;
      }

      .connection-status .pending {
        font-weight: bold;
        color: #856404;
      }

      .pending-sync {
        color: #fd7e14 !important;
      }

      .stat-card:has(.pending-sync) {
        border-left: 4px solid #fd7e14;
      }
    `,
  ],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  showDashboard = false;
  events: AnalyticsEvent[] = [];
  stats: any = {};
  isDashboardEnabled = false;
  isDevelopmentMode = false;

  constructor(private analytics: AnalyticsService) {
    this.isDashboardEnabled = this.analytics.isDashboardEnabled();
    this.isDevelopmentMode = !environment.production;
  }

  ngOnInit(): void {
    // Subscribe to analytics data
    this.analytics.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((events) => {
        this.events = events;
      });

    this.analytics.stats$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      this.stats = stats;
    });

    // Listen for keyboard shortcut to open dashboard (Ctrl+Shift+A)
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key === "A") {
      event.preventDefault();
      this.toggleDashboard();
    }
  }

  toggleDashboard(): void {
    this.showDashboard = !this.showDashboard;
  }

  closeDashboard(): void {
    this.showDashboard = false;
  }

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatEventName(eventType: string): string {
    return eventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  getEventTypes(): { name: string; count: number }[] {
    const counts = this.stats.eventCounts || {};
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }

  getLanguages(): { name: string; count: number; percentage: number }[] {
    const distribution = this.stats.languageDistribution || {};
    const total = Object.values(distribution).reduce(
      (sum: number, count) => sum + (count as number),
      0
    );

    return Object.entries(distribution)
      .map(([name, count]) => ({
        name: name.toUpperCase(),
        count: count as number,
        percentage: total > 0 ? ((count as number) / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  getRecentEvents(): AnalyticsEvent[] {
    return this.events.slice(-10).reverse();
  }

  getEventDetails(event: AnalyticsEvent): string {
    const details = event.details;

    if (details["appCreated"]) {
      return `Prompt: "${details["appCreated"].prompt?.substring(0, 50)}..."`;
    } else if (details["appModified"]) {
      return `Modification: "${details["appModified"].modification?.substring(
        0,
        50
      )}..."`;
    } else if (details["voiceInputUsed"]) {
      return `Duration: ${details["voiceInputUsed"].duration}s`;
    } else if (details["appSaved"]) {
      return `App: "${details["appSaved"].appName}"`;
    } else if (details["appDeleted"]) {
      return `App: "${details["appDeleted"].appName}"`;
    } else if (details["apiError"]) {
      return `${details["apiError"].endpoint} - ${details["apiError"].statusCode}`;
    } else if (details["languageChanged"]) {
      return `${details["languageChanged"].fromLanguage} → ${details["languageChanged"].toLanguage}`;
    }

    return JSON.stringify(details).substring(0, 50) + "...";
  }

  exportData(): void {
    const data = this.analytics.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minicoder-analytics-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearData(): void {
    if (
      confirm(
        "Are you sure you want to clear all analytics data? This cannot be undone."
      )
    ) {
      this.analytics.clearAnalytics();
    }
  }
}
