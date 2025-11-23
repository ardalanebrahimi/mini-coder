import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

// Language detection using franc-min
import { franc } from "franc-min";
import { environment } from "../../environments/environment";
import { CodeMinifierService } from "./code-minifier.service";

export interface ProcessedCommand {
  id?: number;
  userCommand?: string;
  detectedLanguage: string;
  generatedCode: string;
  sanitizedCode?: SafeHtml;
  projectName: string;
  isReadOnly?: boolean; // For App Store projects that can't be edited
}

@Injectable({
  providedIn: "root",
})
export class PromptProcessorService {
  private readonly miniCoderApiUrl = `${environment.apiUrl}/ai/mini-coder`;
  private readonly supportedLanguages = ["en", "de"];

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private codeMinifierService: CodeMinifierService
  ) {}

  /**
   * Process a natural language command and generate a mini app
   * @param command - The user's command in English or German
   * @returns Observable with processed result
   */
  processCommand(command: string): Observable<ProcessedCommand> {
    if (!command.trim()) {
      return throwError(() => new Error("Command cannot be empty"));
    }

    // Detect language using franc-min
    const detectedLanguage = this.detectLanguage(command);

    // Call backend API (which handles OpenAI securely)
    return this.http
      .post<{
        generatedCode: string;
        projectName: string;
        detectedLanguage: string;
        tokensRemaining: number;
        usage: any;
      }>(`${this.miniCoderApiUrl}/generate`, {
        command: command.trim(),
        detectedLanguage,
      })
      .pipe(
        map((response) => {
          const sanitizedCode = this.sanitizeCode(response.generatedCode);

          return {
            detectedLanguage: response.detectedLanguage,
            generatedCode: response.generatedCode,
            sanitizedCode,
            projectName: response.projectName,
          };
        }),
        catchError((error) => {
          console.error("Error processing command:", error);

          // Handle specific error codes
          if (error.status === 403) {
            return throwError(() => new Error("Out of tokens. Please purchase more tokens to continue."));
          }

          if (error.status === 401) {
            return throwError(() => new Error("Authentication required. Please log in."));
          }

          return throwError(() => new Error(error.error?.error || "Failed to generate app. Please try again."));
        })
      );
  }

  /**
   * Process a modify command with current app code included in the prompt
   * @param modifyCommand - The user's modification instruction
   * @param currentAppCode - The current app's HTML/CSS/JS code
   * @param currentAppName - The current app's name (preserved during modification)
   * @returns Observable with processed result
   */
  processModifyCommand(
    modifyCommand: string,
    currentAppCode: string,
    currentAppName?: string
  ): Observable<ProcessedCommand> {
    if (!modifyCommand.trim()) {
      return throwError(() => new Error("Modify command cannot be empty"));
    }

    if (!currentAppCode?.trim()) {
      return throwError(
        () => new Error("Current app code is required for modification")
      );
    }

    // Detect language of the modify command
    const detectedLanguage = this.detectLanguage(modifyCommand);

    // Minify the current app code to reduce token usage
    const minifiedCode = this.codeMinifierService.minifyHtml(currentAppCode);

    // Log minification results for debugging
    const sizeReduction = this.codeMinifierService.getSizeReduction(
      currentAppCode,
      minifiedCode
    );
    console.log(
      `Code minification: ${sizeReduction} reduction (${currentAppCode.length} → ${minifiedCode.length} chars)`
    );

    // Call backend API for modification
    return this.http
      .post<{
        generatedCode: string;
        projectName: string;
        detectedLanguage: string;
        tokensRemaining: number;
        usage: any;
      }>(`${this.miniCoderApiUrl}/modify`, {
        command: modifyCommand.trim(),
        currentAppCode: minifiedCode,
        currentAppName,
        detectedLanguage,
      })
      .pipe(
        map((response) => {
          const sanitizedCode = this.sanitizeCode(response.generatedCode);

          return {
            userCommand: modifyCommand,
            detectedLanguage: response.detectedLanguage,
            generatedCode: response.generatedCode,
            sanitizedCode,
            projectName: response.projectName,
          };
        }),
        catchError((error) => {
          console.error("Error processing modify command:", error);

          // Handle specific error codes
          if (error.status === 403) {
            return throwError(() => new Error("Out of tokens. Please purchase more tokens to continue."));
          }

          if (error.status === 401) {
            return throwError(() => new Error("Authentication required. Please log in."));
          }

          return throwError(() => new Error(error.error?.error || "Failed to modify app. Please try again."));
        })
      );
  }

  /**
   * Detect language using franc-min library
   * @param text - Text to analyze
   * @returns Language code (en, de, or en as fallback)
   */
  private detectLanguage(text: string): string {
    try {
      const detected = franc(text);

      // Map franc language codes to our supported languages
      const languageMap: { [key: string]: string } = {
        eng: "en",
        deu: "de",
        ger: "de",
      };

      const mappedLanguage = languageMap[detected];
      return this.supportedLanguages.includes(mappedLanguage)
        ? mappedLanguage
        : "en";
    } catch (error) {
      console.warn("Language detection failed, defaulting to English:", error);
      return "en";
    }
  }

  /**
   * Sanitize HTML code for safe rendering
   * @param code - Raw HTML code
   * @returns Sanitized HTML
   */
  private sanitizeCode(code: string): SafeHtml {
    // Use DomSanitizer to sanitize the HTML
    return this.sanitizer.bypassSecurityTrustHtml(code);
  }
}
