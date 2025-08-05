import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AppNameGeneratorService {
  private readonly openaiApiUrl = "https://api.openai.com/v1/chat/completions";

  constructor(private http: HttpClient) {}

  /**
   * Generate a catchy, kid-friendly app name based on the user's prompt
   * @param userPrompt - The original user command/prompt
   * @param language - The detected language ('en' or 'de')
   * @returns Observable with generated app name
   */
  generateAppName(userPrompt: string, language: string): Observable<string> {
    // Create a specialized prompt for name generation
    const namePrompt = this.createNameGenerationPrompt(userPrompt, language);

    return this.callOpenAIForName(namePrompt).pipe(
      map((response) => this.extractNameFromResponse(response, language)),
      catchError((error) => {
        console.warn(
          "Failed to generate AI name, falling back to simple name:",
          error
        );
        // Fallback to simple name generation if AI fails
        return of(this.generateFallbackName(userPrompt));
      })
    );
  }

  /**
   * Create a specialized prompt for generating app names
   * @param userPrompt - The original user command
   * @param language - The detected language
   * @returns Formatted prompt for OpenAI
   */
  private createNameGenerationPrompt(
    userPrompt: string,
    language: string
  ): string {
    const langLabel = language === "de" ? "German" : "English";
    const isGerman = language === "de";

    return `You are an expert at creating catchy, kid-friendly app names.

Based on this app description: "${userPrompt}"

Generate a short, catchy, and descriptive app name in ${langLabel}. The name should be:
- 1-4 words maximum
- Kid-friendly and fun
- Descriptive of what the app does
- Creative but clear
- ${isGerman ? "In German language" : "In English"}
- No emojis or special characters
- Appropriate for children aged 7-12

Examples of good names:
${
  isGerman
    ? `- "Tier Quiz" (for animal quiz)
- "Farben Spiel" (for color game)
- "Rechner Pro" (for calculator)
- "Memory Master" (for memory game)`
    : `- "Animal Quiz" (for animal quiz)
- "Color Quest" (for color guessing game)
- "Math Master" (for calculator)
- "Memory Match" (for memory game)`
}

Reply with ONLY the app name, nothing else.`;
  }

  /**
   * Call OpenAI API specifically for name generation
   * @param prompt - The name generation prompt
   * @returns Observable with OpenAI response
   */
  private callOpenAIForName(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.openaiApiKey}`,
    });

    const body = {
      model: "gpt-4o-mini", // Use faster, cheaper model for name generation
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating catchy, kid-friendly app names. Always respond with just the name, no explanations or quotes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 20, // Very short response needed
      temperature: 0.8, // Higher creativity for names
    };

    return this.http.post(this.openaiApiUrl, body, { headers });
  }

  /**
   * Extract the app name from OpenAI response
   * @param response - OpenAI API response
   * @param language - The target language for validation
   * @returns Clean app name
   */
  private extractNameFromResponse(response: any, language: string): string {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in response");
      }

      // Clean the response - remove quotes, extra whitespace, etc.
      let name = content
        .trim()
        .replace(/^["']|["']$/g, "") // Remove surrounding quotes
        .replace(/[^\w\s\-äöüÄÖÜß]/g, "") // Remove special chars except German umlauts and hyphens
        .trim();

      // Validate the name
      if (name.length === 0 || name.length > 50) {
        throw new Error("Invalid name length");
      }

      // Capitalize first letter of each word
      name = name
        .split(/\s+/)
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      return name;
    } catch (error) {
      console.warn("Error extracting name from response:", error);
      throw error;
    }
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
