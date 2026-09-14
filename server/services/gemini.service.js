import { GoogleGenAI } from "@google/genai";

const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

let aiClientInstance = null;

function getAiClient() {
  if (!aiClientInstance) {
    if (!process.env.GEMINI_API_KEY) {
      const error = new Error("GEMINI_API_KEY is not configured.");
      error.category = "provider_error";
      throw error;
    }

    aiClientInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return aiClientInstance;
}

/**
 * Low-level adapter for Google Gemini API.
 * Never imports aiGateway to prevent circular dependencies.
 */
export const callGeminiApi = async ({
  model = DEFAULT_GEMINI_MODEL,
  prompt,
  systemInstruction,
  temperature = 0.7,
  maxTokens,
  responseMimeType,
  timeoutMs = 15000,
}) => {
  const ai = getAiClient();

  const config = {};

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  if (typeof temperature === "number") {
    config.temperature = temperature;
  }

  if (typeof maxTokens === "number") {
    config.maxOutputTokens = maxTokens;
  }

  if (responseMimeType) {
    config.responseMimeType = responseMimeType;
  }

  const callPromise = ai.models.generateContent({
    model,
    contents: prompt,
    config: Object.keys(config).length > 0 ? config : undefined,
  });

  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const timeoutError = new Error(
        `Gemini request timed out after ${timeoutMs}ms`
      );
      timeoutError.category = "timeout";
      timeoutError.code = "ETIMEDOUT";
      reject(timeoutError);
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([callPromise, timeoutPromise]);

    clearTimeout(timer);

    const text = response?.text;

    if (!text || !text.trim()) {
      const emptyError = new Error("Gemini returned an empty response.");
      emptyError.category = "empty_response";
      throw emptyError;
    }

    return text.trim();
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
};

/**
 * Backward-compatible helper for legacy callers.
 */
export const askGemini = async (
  messages,
  model = DEFAULT_GEMINI_MODEL
) => {
  const prompt = Array.isArray(messages)
    ? messages
        .map((message) => {
          const role = message.role?.toUpperCase() || "USER";
          return `${role}:\n${message.content}`;
        })
        .join("\n\n")
    : String(messages || "");

  return callGeminiApi({
    model,
    prompt,
    timeoutMs: 15000,
  });
};