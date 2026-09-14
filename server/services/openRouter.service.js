import axios from "axios";

export const DEFAULT_OPENROUTER_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
];

export function getOpenRouterModels() {
  if (process.env.OPENROUTER_FREE_MODELS) {
    const parsed = process.env.OPENROUTER_FREE_MODELS
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean);

    if (parsed.length > 0) {
      return parsed;
    }
  }

  return DEFAULT_OPENROUTER_MODELS;
}

/**
 * Low-level adapter for OpenRouter API.
 * Never imports aiGateway to prevent circular dependencies.
 */
export const callOpenRouterApi = async ({
  model,
  messages,
  maxTokens = 3500,
  temperature = 0.7,
  timeoutMs = 12000,
}) => {
  if (!process.env.OPENROUTER_API_KEY) {
    const error = new Error("OPENROUTER_API_KEY is not configured.");
    error.category = "provider_error";
    throw error;
  }

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: timeoutMs,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;

  if (!content || !content.trim()) {
    const error = new Error(
      `OpenRouter model ${model} returned an empty response.`
    );
    error.category = "empty_response";
    throw error;
  }

  return content.trim();
};

/**
 * Backward-compatible helper for legacy callers.
 */
export const askAI = async (messages, options = {}) => {
  const models = getOpenRouterModels();
  let lastError = null;

  for (const model of models) {
    try {
      return await callOpenRouterApi({
        model,
        messages,
        maxTokens: options.maxTokens || 3500,
        temperature: options.temperature ?? 0.7,
        timeoutMs: options.timeoutMs || 12000,
      });
    } catch (error) {
      lastError = error;

      console.warn(
        `[OpenRouter] ${model} failed:`,
        error.message
      );
    }
  }

  const safeMessage =
    lastError?.response?.data?.error?.message ||
    lastError?.message ||
    "All configured free AI models failed.";

  const error = new Error(safeMessage);
  error.status = 502;
  throw error;
};