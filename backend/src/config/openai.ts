import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Validate OpenAI configuration
export const validateOpenAIConfig = (): boolean => {
  const apiKey = process.env["OPENAI_API_KEY"];

  if (!apiKey || apiKey === "your-openai-api-key-here") {
    console.error(
      "❌ OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file."
    );
    return false;
  }

  console.log("✅ OpenAI configuration validated");
  return true;
};

// Default model configuration
export const DEFAULT_MODEL = "gpt-3.5-turbo";
export const MAX_TOKENS = 2000;
export const TEMPERATURE = 0.7;

export default openai;
