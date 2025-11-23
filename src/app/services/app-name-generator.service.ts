import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";

/**
 * @deprecated This service is deprecated. App name generation is now handled by the backend
 * as part of the mini app generation process for security reasons.
 * This service is kept for backward compatibility but should not be used directly.
 */
@Injectable({
  providedIn: "root",
})
export class AppNameGeneratorService {
  private readonly miniCoderApiUrl = `${environment.apiUrl}/ai/mini-coder`;

  constructor(private http: HttpClient) {}

  /**
   * Generate a catchy, kid-friendly app name based on the user's prompt
   * @param userPrompt - The original user command/prompt
   * @param language - The detected language ('en' or 'de')
   * @returns Observable with generated app name
   * @deprecated Use backend mini-coder API instead
   */
  generateAppName(userPrompt: string, language: string): Observable<string> {
    // Call backend API for app name generation
    return this.http
      .post<{ appName: string; tokensRemaining: number }>(
        `${this.miniCoderApiUrl}/app-name`,
        {
          command: userPrompt,
          detectedLanguage: language,
        }
      )
      .pipe(
        map((response) => response.appName),
        catchError((error) => {
          console.warn(
            "Failed to generate AI name, falling back to simple name:",
            error
          );
          // Fallback to simple name generation if API fails
          return of(this.generateFallbackName(userPrompt));
        })
      );
  }

  /**
   * Generate a fallback name if AI generation fails
   * @param userPrompt - The original user command
   * @returns Simple generated name
   */
  private generateFallbackName(userPrompt: string): string {
    // Extract meaningful words and create a project name
    const words = userPrompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 3);

    if (words.length === 0) {
      return "Mini App";
    }

    // Capitalize first letter of each word
    const capitalizedWords = words.map(
      (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
    );

    return capitalizedWords.join(" ");
  }
}
