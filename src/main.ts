import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { importProvidersFrom, ErrorHandler, Injectable } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideRouter, Routes } from "@angular/router";

import { RootComponent } from "./app/root.component";
import { AppComponent } from "./app/app.component";
import { LoginComponent } from "./app/auth/login.component";
import { RegisterComponent } from "./app/auth/register.component";
import { LandingComponent } from "./app/landing/landing.component";
import { SharedPreviewComponent } from "./app/shared-preview/shared-preview.component";
import { AuthInterceptor } from "./app/services/auth.interceptor";
import {
  AnalyticsService,
  AnalyticsEventType,
} from "./app/services/analytics.service";
// import { AnalyticsInterceptor } from "./app/services/analytics.interceptor"; // Removed to prevent circular dependency
import { AuthGuard } from "./app/services/auth.guard";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private analytics?: AnalyticsService;

  handleError(error: any): void {
    console.error("Global error caught:", error);

    // Try to get analytics service from the injector
    if (!this.analytics) {
      try {
        // Use a timeout to ensure analytics service is available
        setTimeout(() => {
          if (window && (window as any).angularAnalyticsService) {
            this.analytics = (window as any).angularAnalyticsService;
            this.logError(error);
          }
        }, 100);
      } catch (e) {
        console.error("Could not log error to analytics:", e);
      }
    } else {
      this.logError(error);
    }
  }

  private logError(error: any): void {
    if (this.analytics) {
      this.analytics.logEvent(AnalyticsEventType.APP_ERROR, {
        appError: {
          errorMessage: error.message || "Unknown error",
          context: "global_error_handler",
          stackTrace: error.stack,
        },
      });
    }
  }
}

const routes: Routes = [
  { path: "landing", component: LandingComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "home", component: AppComponent, canActivate: [AuthGuard] },
  { path: "shared/:shareId", component: SharedPreviewComponent },
  { path: "", redirectTo: "/landing", pathMatch: "full" },
];

bootstrapApplication(RootComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    // Analytics interceptor removed to prevent circular dependency
    // API errors will be logged directly in services instead
  ],
}).catch((err) => console.error(err));
