import openai from "../config/openai";

export interface GenerateMiniAppRequest {
  command: string;
  detectedLanguage: string;
}

export interface ModifyMiniAppRequest {
  command: string;
  currentAppCode: string;
  currentAppName?: string;
  detectedLanguage: string;
}

export interface GenerateAppNameRequest {
  command: string;
  detectedLanguage: string;
}

export interface TranscribeAudioRequest {
  audioFile: Buffer;
  mimeType: string;
}

export interface MiniAppResponse {
  generatedCode: string;
  projectName: string;
  detectedLanguage: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Load prompts from environment variables
const SYSTEM_PROMPT = process.env['SYSTEM_PROMPT'] ||
  "You are an expert children's web developer who creates colorful, interactive, and fully functional mini web apps for kids aged 7-12.";

const FIX_INSTRUCTIONS = process.env['OPENAI_FIX_INSTRUCTIONS'] ||
  "You are an expert at creating safe, fun, and FUNCTIONAL mini web apps for kids aged 7–12. Create a complete, fully working HTML page with all CSS in <style> and all JavaScript in <script> tags. Reply ONLY with the HTML code — no explanations.";

export class MiniCoderService {
  /**
   * Generate a mini app from a user command
   */
  async generateMiniApp(
    request: GenerateMiniAppRequest
  ): Promise<MiniAppResponse> {
    const { command, detectedLanguage } = request;

    const langLabel = detectedLanguage === "de" ? "German" : "English";
    const prompt = `${FIX_INSTRUCTIONS}\n\ncommand in ${langLabel}: ${command}`;

    try {
      // Generate code and app name in parallel
      const [codeResult, appName] = await Promise.all([
        this.callOpenAI(prompt, 3000),
        this.generateAppName({ command, detectedLanguage }),
      ]);

      const generatedCode = this.extractCodeFromResponse(codeResult.content);

      return {
        generatedCode,
        projectName: appName,
        detectedLanguage,
        usage: codeResult.usage,
      };
    } catch (error) {
      console.error("Error generating mini app:", error);
      throw error;
    }
  }

  /**
   * Modify an existing mini app
   */
  async modifyMiniApp(
    request: ModifyMiniAppRequest
  ): Promise<MiniAppResponse> {
    const { command, currentAppCode, currentAppName, detectedLanguage } =
      request;

    const langLabel = detectedLanguage === "de" ? "German" : "English";

    const prompt = `You are an expert at updating kid-friendly web apps.

Here is the current app code:
---
${currentAppCode}
---

Modify this app as follows (command in ${langLabel}):
${command}

Instructions:
- Only reply with the complete, updated HTML code
- Keep it colorful, safe, and fun for kids
- Make sure all features work properly
- Preserve the overall structure while implementing the requested changes
- Use inline CSS and JavaScript as needed`;

    try {
      const result = await this.callOpenAI(prompt, 3000);
      const generatedCode = this.extractCodeFromResponse(result.content);

      return {
        generatedCode,
        projectName: currentAppName || "Modified App",
        detectedLanguage,
        usage: result.usage,
      };
    } catch (error) {
      console.error("Error modifying mini app:", error);
      throw error;
    }
  }

  /**
   * Generate a creative app name
   */
  async generateAppName(request: GenerateAppNameRequest): Promise<string> {
    const { command, detectedLanguage } = request;

    const langLabel = detectedLanguage === "de" ? "German" : "English";

    const prompt = `Based on this app description in ${langLabel}: "${command}"

Generate a short, catchy, kid-friendly app name (2-4 words maximum).
Rules:
- Use simple words kids can understand
- Make it fun and exciting
- No special characters
- Respond with ONLY the app name, nothing else`;

    try {
      const result = await this.callOpenAI(prompt, 50);
      return result.content.trim().replace(/['"]/g, "");
    } catch (error) {
      console.error("Error generating app name:", error);
      // Fallback to simple name generation
      return this.generateFallbackName(command);
    }
  }

  /**
   * Transcribe audio using Whisper API
   */
  async transcribeAudio(request: TranscribeAudioRequest): Promise<string> {
    const { audioFile, mimeType } = request;

    try {
      // Create a File-like object from the buffer
      const file = new File([audioFile], "audio.webm", { type: mimeType });

      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });

      return transcription.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  /**
   * Call OpenAI chat completions API
   */
  private async callOpenAI(
    userPrompt: string,
    maxTokens: number = 3000
  ): Promise<{ content: string; usage: any }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "assistant",
            content:
              "Remember: Always reply with a single, complete HTML file. Make it colorful, safe, and fun for kids. All features must work.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.2,
      });

      const choice = completion.choices[0];
      if (!choice || !choice.message) {
        throw new Error("No response from OpenAI");
      }

      return {
        content: choice.message.content || "",
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }

  /**
   * Extract HTML code from OpenAI response
   */
  private extractCodeFromResponse(response: string): string {
    // Remove markdown code blocks if present
    let code = response.replace(/```html\n?/g, "").replace(/```\n?/g, "");

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
  }

  /**
   * Generate a fallback name from command
   */
  private generateFallbackName(command: string): string {
    const words = command
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 3);

    return words.length > 0
      ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "Mini App";
  }
}
