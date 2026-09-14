import { callGeminiApi } from "./gemini.service.js";
import { callOpenRouterApi, getOpenRouterModels } from "./openRouter.service.js";
import { cleanAndParseJson } from "../utils/jsonParser.js";

/**
 * Task-Aware Configuration Profiles
 * Maps each domain capability to primary & secondary models and calibrated timeouts.
 */
let customAdapter = null;

export function setCustomAdapter(fn) {
  customAdapter = fn;
}

export function resetCustomAdapter() {
  customAdapter = null;
}

export const TASK_PROFILES = {
  gd_turn: {
    name: "GD Participant Turn",
    primaryProvider: "gemini",
    primaryModel: process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    fallbackProvider: "openRouter",
    timeoutMs: 10000,
    temperature: 0.7,
    maxTokens: 600,
  },
  gd_opening: {
    name: "GD Opening Statement",
    primaryProvider: "gemini",
    primaryModel: process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    fallbackProvider: "openRouter",
    timeoutMs: 10000,
    temperature: 0.5,
    maxTokens: 400,
  },
  ats: {
    name: "ATS Resume Analysis",
    primaryProvider: "gemini",
    primaryModel: process.env.GEMINI_EVAL_MODEL || "gemini-3.5-flash",
    fallbackProvider: "openRouter",
    timeoutMs: 18000,
    temperature: 0.2,
    maxTokens: 3500,
    responseMimeType: "application/json",
  },
  gd_evaluation: {
    name: "GD Evaluation Scorecard",
    primaryProvider: "gemini",
    primaryModel: process.env.GEMINI_EVAL_MODEL || "gemini-3.5-flash",
    fallbackProvider: "openRouter",
    timeoutMs: 18000,
    temperature: 0.3,
    maxTokens: 3500,
    responseMimeType: "application/json",
  },
  interview: {
    name: "Interview Q&A",
    primaryProvider: "gemini",
    primaryModel: process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    fallbackProvider: "openRouter",
    timeoutMs: 15000,
    temperature: 0.4,
    maxTokens: 2500,
  },
  aptitude: {
    name: "Aptitude Exam Generator",
    primaryProvider: "gemini",
    primaryModel: process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    fallbackProvider: "openRouter",
    timeoutMs: 20000,
    temperature: 0.3,
    maxTokens: 3500,
    responseMimeType: "application/json",
  },
};

/**
 * In-Memory Circuit Breaker & Model Health Registry
 */
class ModelCircuitBreaker {
  constructor() {
    this.modelHealth = new Map();
  }

  getKey(provider, model) {
    return `${provider}:${model}`;
  }

  isAvailable(provider, model) {
    const key = this.getKey(provider, model);
    const health = this.modelHealth.get(key);
    if (!health) return true;

    if (health.trippedUntil && Date.now() < health.trippedUntil) {
      return false;
    }

    if (health.trippedUntil && Date.now() >= health.trippedUntil) {
      this.modelHealth.delete(key);
      return true;
    }

    return true;
  }

  recordSuccess(provider, model) {
    const key = this.getKey(provider, model);
    this.modelHealth.delete(key);
  }

  recordFailure(provider, model, category) {
    const key = this.getKey(provider, model);
    const current = this.modelHealth.get(key) || { failureCount: 0 };
    const failureCount = current.failureCount + 1;

    let cooldownMs = 120000; // 2 minutes default

    if (category === "unavailable_model") {
      cooldownMs = 900000; // 15 minutes for 404/deprecated
    } else if (category === "rate_limit") {
      cooldownMs = 300000; // 5 minutes for 429
    } else if (category === "timeout") {
      cooldownMs = 180000; // 3 minutes for timeouts
    }

    this.modelHealth.set(key, {
      failureCount,
      trippedUntil: Date.now() + cooldownMs,
      lastCategory: category,
      lastFailureTime: Date.now(),
    });
  }

  reset() {
    this.modelHealth.clear();
  }
}

export const circuitBreaker = new ModelCircuitBreaker();

/**
 * Categorizes an error into a standardized taxonomy:
 * 'timeout' | 'rate_limit' | 'unavailable_model' | 'empty_response' | 'invalid_json' | 'schema_error' | 'provider_error'
 */
export function categorizeError(err) {
  if (!err) return "provider_error";
  if (err.category) return err.category;

  const msg = (err.message || "").toLowerCase();
  const status = err.response?.status || err.status;

  if (
    err.code === "ETIMEDOUT" ||
    err.code === "ECONNABORTED" ||
    err.name === "AbortError" ||
    msg.includes("timeout") ||
    msg.includes("timed out")
  ) {
    return "timeout";
  }

  if (status === 429 || msg.includes("rate limit") || msg.includes("quota") || msg.includes("resource_exhausted")) {
    return "rate_limit";
  }

  if (
    status === 404 ||
    status === 400 ||
    msg.includes("not found") ||
    msg.includes("unavailable for free") ||
    msg.includes("no longer available") ||
    msg.includes("deprecated")
  ) {
    return "unavailable_model";
  }

  if (msg.includes("empty response") || msg.includes("empty text")) {
    return "empty_response";
  }

  if (err instanceof SyntaxError || msg.includes("unexpected token") || msg.includes("invalid json")) {
    return "invalid_json";
  }

  if (
    msg.includes("schema") ||
    msg.includes("validation") ||
    msg.includes("missing required") ||
    msg.includes("must include") ||
    msg.includes("invalid analysis response")
  ) {
    return "schema_error";
  }

  return "provider_error";
}

/**
 * Builds candidate execution chain for a given task.
 */
function buildCandidateChain(taskProfile, customChain = null) {
  if (Array.isArray(customChain) && customChain.length > 0) {
    return customChain;
  }

  const chain = [];

  // Primary: Gemini
  if (taskProfile.primaryProvider === "gemini") {
    chain.push({
      provider: "gemini",
      model: taskProfile.primaryModel,
    });
  }

  // Secondary: OpenRouter verified free model pool
  const openRouterModels = getOpenRouterModels();
  for (const orModel of openRouterModels) {
    chain.push({
      provider: "openRouter",
      model: orModel,
    });
  }

  return chain;
}

/**
 * Centralized AI Gateway: Executes text generation across resilient fallback tiers.
 */
export async function generateText({
  task = "gd_turn",
  messages = [],
  prompt = null,
  systemInstruction = null,
  temperature,
  maxTokens,
  timeoutMs,
  candidateChain = null,
}) {
  const profile = TASK_PROFILES[task] || TASK_PROFILES.gd_turn;
  const effectiveTimeout = timeoutMs || profile.timeoutMs || 12000;
  const effectiveTemp = typeof temperature === "number" ? temperature : profile.temperature;
  const effectiveMaxTokens = maxTokens || profile.maxTokens;

  // Normalize prompt and messages
  let normalizedMessages = messages;
  let normalizedPrompt = prompt;

  if (!normalizedPrompt && Array.isArray(messages) && messages.length > 0) {
    normalizedPrompt = messages
      .map((m) => `${(m.role || "user").toUpperCase()}:\n${m.content || ""}`)
      .join("\n\n");
  }

  if ((!normalizedMessages || normalizedMessages.length === 0) && normalizedPrompt) {
    normalizedMessages = [{ role: "user", content: normalizedPrompt }];
  }

  const candidates = buildCandidateChain(profile, candidateChain);
  let lastError = null;

  for (const candidate of candidates) {
    const { provider, model } = candidate;

    // Check circuit breaker status
    if (!circuitBreaker.isAvailable(provider, model)) {
      continue;
    }

    const startTime = Date.now();

    try {
      let rawText;

      if (customAdapter) {
        rawText = await customAdapter({
          provider,
          model,
          prompt: normalizedPrompt,
          messages: normalizedMessages,
          systemInstruction,
          temperature: effectiveTemp,
          maxTokens: effectiveMaxTokens,
          timeoutMs: effectiveTimeout,
          isStructured: false,
        });
      } else if (provider === "gemini") {
        rawText = await callGeminiApi({
          model,
          prompt: normalizedPrompt,
          systemInstruction,
          temperature: effectiveTemp,
          maxTokens: effectiveMaxTokens,
          timeoutMs: effectiveTimeout,
        });
      } else if (provider === "openRouter") {
        rawText = await callOpenRouterApi({
          model,
          messages: normalizedMessages,
          temperature: effectiveTemp,
          maxTokens: effectiveMaxTokens,
          timeoutMs: effectiveTimeout,
        });
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }

      if (!rawText || !rawText.trim()) {
        const emptyErr = new Error("Model returned empty text.");
        emptyErr.category = "empty_response";
        throw emptyErr;
      }

      // Success: register health and return
      circuitBreaker.recordSuccess(provider, model);
      return rawText.trim();
    } catch (candidateError) {
      lastError = candidateError;
      const category = categorizeError(candidateError);
      circuitBreaker.recordFailure(provider, model, category);

      console.warn(
        `[AIGateway] Candidate failed. Task: ${task}, Provider: ${provider}, Model: ${model}, Category: ${category}, Latency: ${Date.now() - startTime}ms`
      );
    }
  }

  // All candidates exhausted: return safe application-level error
  const safeError = new Error(
    "AI service is temporarily unavailable. All configured providers failed."
  );
  safeError.status = 502;
  safeError.category = lastError ? categorizeError(lastError) : "provider_error";
  throw safeError;
}

/**
 * Centralized AI Gateway: Executes structured JSON generation with schema validation and fallback.
 */
export async function generateStructured({
  task = "ats",
  messages = [],
  prompt = null,
  systemInstruction = null,
  temperature,
  maxTokens,
  timeoutMs,
  schemaValidator = null,
  candidateChain = null,
}) {
  const profile = TASK_PROFILES[task] || TASK_PROFILES.ats;
  const effectiveTimeout = timeoutMs || profile.timeoutMs || 18000;
  const effectiveTemp = typeof temperature === "number" ? temperature : profile.temperature;
  const effectiveMaxTokens = maxTokens || profile.maxTokens;

  let normalizedMessages = messages;
  let normalizedPrompt = prompt;

  if (!normalizedPrompt && Array.isArray(messages) && messages.length > 0) {
    normalizedPrompt = messages
      .map((m) => `${(m.role || "user").toUpperCase()}:\n${m.content || ""}`)
      .join("\n\n");
  }

  if ((!normalizedMessages || normalizedMessages.length === 0) && normalizedPrompt) {
    normalizedMessages = [{ role: "user", content: normalizedPrompt }];
  }

  const candidates = buildCandidateChain(profile, candidateChain);
  let lastError = null;

  for (const candidate of candidates) {
    const { provider, model } = candidate;

    if (!circuitBreaker.isAvailable(provider, model)) {
      continue;
    }

    const startTime = Date.now();

    try {
      let rawText;

      if (customAdapter) {
        rawText = await customAdapter({
          provider,
          model,
          prompt: normalizedPrompt,
          messages: normalizedMessages,
          systemInstruction,
          temperature: effectiveTemp,
          maxTokens: effectiveMaxTokens,
          responseMimeType: "application/json",
          timeoutMs: effectiveTimeout,
          isStructured: true,
        });
      } else if (provider === "gemini") {
        rawText = await callGeminiApi({
          model,
          prompt: normalizedPrompt,
          systemInstruction,
          temperature: effectiveTemp,
          maxTokens: effectiveMaxTokens,
          responseMimeType: "application/json",
          timeoutMs: effectiveTimeout,
        });
      } else if (provider === "openRouter") {
        rawText = await callOpenRouterApi({
          model,
          messages: normalizedMessages,
          temperature: effectiveTemp,
          maxTokens: effectiveMaxTokens,
          timeoutMs: effectiveTimeout,
        });
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }

      // Robust JSON Parsing with markdown code fence handling and trailing comma recovery
      let parsedJson;
      try {
        parsedJson = cleanAndParseJson(rawText);
      } catch (parseErr) {
        parseErr.category = "invalid_json";
        throw parseErr;
      }

      // Schema Validation
      if (typeof schemaValidator === "function") {
        try {
          const validated = schemaValidator(parsedJson);
          if (validated !== undefined) {
            parsedJson = validated;
          }
        } catch (validationErr) {
          validationErr.category = "schema_error";
          throw validationErr;
        }
      }

      circuitBreaker.recordSuccess(provider, model);
      return parsedJson;
    } catch (candidateError) {
      lastError = candidateError;
      const category = categorizeError(candidateError);
      circuitBreaker.recordFailure(provider, model, category);

      console.warn(
        `[AIGateway] Candidate structured failure. Task: ${task}, Provider: ${provider}, Model: ${model}, Category: ${category}, Latency: ${Date.now() - startTime}ms`
      );
    }
  }

  const safeError = new Error(
    "AI analysis service is temporarily unavailable. All configured providers failed."
  );
  safeError.status = 502;
  safeError.category = lastError ? categorizeError(lastError) : "provider_error";
  throw safeError;
}

export default {
  generateText,
  generateStructured,
  circuitBreaker,
  categorizeError,
  TASK_PROFILES,
  setCustomAdapter,
  resetCustomAdapter,
};
