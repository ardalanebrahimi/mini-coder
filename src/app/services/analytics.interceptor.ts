import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AnalyticsService } from "./analytics.service";

/**
 * HTTP Interceptor that automatically logs API errors to analytics
 * This helps track backend issues and API reliability
 */
@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {
  constructor(private analytics: AnalyticsService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap({
        error: (error: HttpErrorResponse) => {
          // Log API errors to analytics
          this.analytics.logApiError(
            req.url,
            error.status,
            error.message || error.statusText || "Unknown error"
          );
        },
      })
    );
  }
}
