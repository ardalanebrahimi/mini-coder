import openai, {
  DEFAULT_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
} from "../config/openai";

export interface GenerateCodeRequest {
  prompt: string;
  language?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateCodeResponse {
  generatedCode: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export class AIService {
  async generateCode(
    request: GenerateCodeRequest
  ): Promise<GenerateCodeResponse> {
    const {
      prompt,
      language,
      context,
      maxTokens = MAX_TOKENS,
      temperature = TEMPERATURE,
    } = request;

    // Build the system prompt for code generation
    let systemPrompt =
      "You are an expert software developer. Generate clean, well-commented, and functional code based on the user's request.";

    if (language) {
      systemPrompt += ` The code should be written in ${language}.`;
    }

    if (context) {
      systemPrompt += ` Additional context: ${context}`;
    }

    // Build the user prompt
    let userPrompt = prompt;

    // Add specific instructions for better code generation
    userPrompt +=
      "\n\nPlease provide:\n1. Clean, readable code\n2. Appropriate comments\n3. Error handling where applicable\n4. Best practices for the specified language";

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const choice = completion.choices[0];
      if (!choice || !choice.message) {
        throw new Error("No response generated from OpenAI");
      }

      return {
        generatedCode: choice.message.content || "",
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        model: completion.model,
        finishReason: choice.finish_reason || "unknown",
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);

      if (error instanceof Error) {
        // Handle specific OpenAI errors
        if (error.message.includes("insufficient_quota")) {
          throw new Error(
            "OpenAI API quota exceeded. Please check your billing."
          );
        }
        if (error.message.includes("invalid_api_key")) {
          throw new Error(
            "Invalid OpenAI API key. Please check your configuration."
          );
        }
        if (error.message.includes("rate_limit_exceeded")) {
          throw new Error(
            "OpenAI API rate limit exceeded. Please try again later."
          );
        }

        throw new Error(`AI generation failed: ${error.message}`);
      }

      throw new Error("Unknown error occurred during AI generation");
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test the API key with a minimal request
      await openai.models.list();
      return true;
    } catch (error) {
      console.error("OpenAI API key validation failed:", error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await openai.models.list();
      return models.data
        .filter((model) => model.id.includes("gpt"))
        .map((model) => model.id)
        .sort();
    } catch (error) {
      console.error("Failed to fetch available models:", error);
      return [DEFAULT_MODEL];
    }
  }
}
