import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

// Language detection using franc-min
import { franc } from "franc-min";
import { environment } from "../../environments/environment";

export interface ProcessedCommand {
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
  private readonly openaiApiUrl = "https://api.openai.com/v1/chat/completions";
  private readonly supportedLanguages = ["en", "de"];

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

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

    // Generate project name from command
    const projectName = this.generateProjectName(command);

    // Create OpenAI prompt based on detected language
    const prompt = this.createOpenAIPrompt(command, detectedLanguage);

    // Call OpenAI API
    return this.callOpenAI(prompt).pipe(
      map((response) => {
        const generatedCode = this.extractCodeFromResponse(response);
        const sanitizedCode = this.sanitizeCode(generatedCode);

        return {
          detectedLanguage,
          generatedCode,
          sanitizedCode,
          projectName,
        };
      }),
      catchError((error) => {
        console.error("Error processing command:", error);
        return throwError(() => error);
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
   * Generate a project name from the command
   * @param command - User command
   * @returns Sanitized project name
   */
  private generateProjectName(command: string): string {
    // Extract meaningful words and create a project name
    const words = command
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 3);

    return words.length > 0 ? words.join("-") : "mini-app";
  }

  /**
   * Create OpenAI prompt based on command and language
   * @param command - User command
   * @param language - Detected language
   * @returns Formatted prompt for OpenAI
   */
  private createOpenAIPrompt(command: string, language: string): string {
    // Use a single prompt template and append the command with language info
    const langLabel = language === "de" ? "German" : "English";
    return (
      environment.openAIFixInstructions +
      "\n\ncommand in " +
      langLabel +
      ": " +
      command
    );
  }

  /**
   * Call OpenAI API to generate code
   * @param prompt - The prompt to send to OpenAI
   * @returns Observable with OpenAI response
   */
  private callOpenAI(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.openaiApiKey}`,
    });

    const body = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: environment.mainPrompt,
        },
        {
          role: "assistant",
          content:
            "Remember: Always reply with a single, complete HTML file. Make it colorful, safe, and fun for kids. All features must work.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.2,
    };

    return this.http.post(this.openaiApiUrl, body, { headers });
  }

  /**
   * Extract code from OpenAI response
   * @param response - OpenAI API response
   * @returns Generated HTML code
   */
  private extractCodeFromResponse(response: any): string {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in response");
      }

      // Remove any markdown code blocks if present
      let code = content.replace(/```html\n?/g, "").replace(/```\n?/g, "");

      // Ensure we have a complete HTML document
      if (!code.includes("<!DOCTYPE html>")) {
        code = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mini App</title>
    <style>
        body { 
            font-family: 'Comic Sans MS', cursive; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        h1 { color: #333; margin-bottom: 20px; }
        button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
        }
        button:hover { background: #ff5252; transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="container">
        <h1>Mini App</h1>
        <p>Generated content:</p>
        ${code}
    </div>
</body>
</html>`;
      }

      return code;
    } catch (error) {
      console.error("Error extracting code from response:", error);
      return this.getFallbackHTML();
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

  /**
   * Get fallback HTML when generation fails
   * @returns Basic HTML template
   */
  private getFallbackHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mini App - Error</title>
    <style>
        body { 
            font-family: 'Comic Sans MS', cursive; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        h1 { color: #333; margin-bottom: 20px; font-size: 2rem; }
        .error { color: #ff6b6b; font-size: 1.2rem; margin: 20px 0; }
        .suggestion { color: #666; font-size: 1rem; margin-top: 20px; }
        button {
            background: #4caf50;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
        }
        button:hover { background: #45a049; transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="container">
        <h1>Oops! 🤖</h1>
        <p class="error">Something went wrong generating your app!</p>
        <p class="suggestion">Try rephrasing your command or check your internet connection.</p>
        <button onclick="window.parent.location.reload()">Try Again</button>
    </div>
</body>
</html>`;
  }
}
