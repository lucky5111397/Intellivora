import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import AptitudeQuestion from "../models/aptitudeQuestion.model.js";
import { findCategory, findTopic } from "../config/aptitudeSyllabus.js";

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

// Default free models for Tier 2 fallback chain
export const DEFAULT_FREE_MODELS = [
  "nvidia/nemotron-3-8b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
];

// Configurable free models list (comma-separated env variable)
export function getOpenRouterFreeModels() {
  if (process.env.OPENROUTER_FREE_MODELS) {
    const list = process.env.OPENROUTER_FREE_MODELS.split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return DEFAULT_FREE_MODELS;
}

const GEMINI_MODEL = process.env.GEMINI_APTITUDE_MODEL || "gemini-2.5-flash";
const AI_TIMEOUT_MS = 25000;

// In-flight concurrency deduplication map
const inFlightGenerations = new Map();

/**
 * Categorizes an error into standardized reliability taxonomy:
 * 'timeout' | 'rate_limit' | 'provider_error' | 'invalid_json' | 'schema_error' | 'unavailable_model'
 */
export function categorizeError(err) {
  if (!err) return "provider_error";
  const msg = (err.message || "").toLowerCase();
  const status = err.response?.status || err.status;

  if (err.code === "ECONNABORTED" || err.name === "AbortError" || msg.includes("timeout") || msg.includes("timed out")) {
    return "timeout";
  }
  if (status === 429 || msg.includes("rate limit") || msg.includes("quota")) {
    return "rate_limit";
  }
  if (status === 404 || msg.includes("not found") || msg.includes("model unavailable") || msg.includes("deprecated")) {
    return "unavailable_model";
  }
  if (err instanceof SyntaxError || msg.includes("unexpected token") || msg.includes("json")) {
    return "invalid_json";
  }
  if (msg.includes("schema") || msg.includes("validation")) {
    return "schema_error";
  }
  return "provider_error";
}

function buildPrompt(categoryName, topicName, difficulty, count) {
  return `You are a professional aptitude exam paper setter for competitive technical and corporate exams (like CAT, GATE, TCS NQT, Infosys, AMCAT, eLitmus).

Generate exactly ${count} multiple-choice questions for:
- Domain/Category: "${categoryName}"
- Topic: "${topicName}"
- Difficulty Level: "${difficulty.toUpperCase()}" (strictly adhere to this difficulty)

CRITICAL INSTRUCTIONS:
1. Every question must have exactly 4 options labeled "A", "B", "C", and "D".
2. Exactly one option must be strictly correct. Set "correctOptionKey" to "A", "B", "C", or "D".
3. Provide a clear, comprehensive step-by-step "explanation" for why the correct option is right.
4. For quantitative/reasoning questions, provide complete numerical and logical calculations in the explanation.
5. All 4 options must be distinct and non-empty strings.
6. The question text must be detailed, unambiguous, and self-contained.
7. Ensure question originality; do not create trivial 1-line questions.
8. Output ONLY valid JSON, absolutely no conversational text or preamble.

OUTPUT FORMAT (JSON ARRAY ONLY):
[
  {
    "question": "Question statement here...",
    "options": [
      { "key": "A", "text": "Option 1" },
      { "key": "B", "text": "Option 2" },
      { "key": "C", "text": "Option 3" },
      { "key": "D", "text": "Option 4" }
    ],
    "correctOptionKey": "A",
    "explanation": "Detailed step-by-step reasoning...",
    "difficulty": "${difficulty.toLowerCase()}"
  }
]`;
}

/**
 * Validates a single question object against the strict aptitude schema.
 */
export function isValidQuestion(q, expectedDifficulty) {
  if (!q || typeof q !== "object") return false;
  if (!q.question || typeof q.question !== "string" || q.question.trim().length < 10) return false;

  if (!Array.isArray(q.options) || q.options.length !== 4) return false;

  const validKeys = ["A", "B", "C", "D"];
  const seenKeys = new Set();
  for (const opt of q.options) {
    if (!opt || typeof opt !== "object") return false;
    const key = String(opt.key || "").trim().toUpperCase();
    const text = String(opt.text || "").trim();
    if (!validKeys.includes(key)) return false;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    if (!text || text.length === 0) return false;
  }

  const correctKey = String(q.correctOptionKey || "").trim().toUpperCase();
  if (!validKeys.includes(correctKey)) return false;

  if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length < 5) return false;

  return true;
}

/**
 * Strips markdown fences or text wrappers and parses JSON array.
 */
export function extractJsonQuestions(rawText) {
  if (!rawText || typeof rawText !== "string") return null;

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    return null;
  } catch {
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Provider 1: OpenRouter
 */
async function callOpenRouter(prompt, model) {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error("OPENROUTER_API_KEY is not configured");
    err.category = "provider_error";
    throw err;
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "system",
            content: "You are an expert aptitude test question generator. Output valid JSON arrays only.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 3500,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: AI_TIMEOUT_MS,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text || !text.trim()) {
      const err = new Error(`OpenRouter returned empty response for model ${model}`);
      err.category = "provider_error";
      throw err;
    }
    return text;
  } catch (err) {
    err.category = categorizeError(err);
    throw err;
  }
}

/**
 * Provider 2: Google Gemini
 */
async function callGemini(prompt, model = GEMINI_MODEL) {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_API_KEY is not configured");
    err.category = "provider_error";
    throw err;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text || !text.trim()) {
      const err = new Error("Gemini returned empty response");
      err.category = "provider_error";
      throw err;
    }
    return text;
  } catch (err) {
    err.category = categorizeError(err);
    throw err;
  }
}

/**
 * Main Question Generation with Multi-Provider Fallback Hierarchy:
 * 1. OpenRouter Primary
 * 2. OpenRouter Free Models list (sequential)
 * 3. Google Gemini
 * 4. Local DB Question Pool
 *
 * Includes in-flight request deduplication to prevent duplicate generation calls.
 */
export async function generateAptitudeQuestions({ category, topic, difficulty = "medium", count = 5 }) {
  const catObj = findCategory(category);
  const topicObj = findTopic(category, topic);

  if (!catObj || !topicObj) {
    throw new Error(`Invalid category "${category}" or topic "${topic}"`);
  }

  const normalizedDifficulty = ["easy", "medium", "hard"].includes(difficulty.toLowerCase())
    ? difficulty.toLowerCase()
    : "medium";

  // In-flight concurrency deduplication key
  const requestKey = `${category}:${topic}:${normalizedDifficulty}`;
  if (inFlightGenerations.has(requestKey)) {
    console.log(`[AI Question Gen] Coalescing duplicate in-flight generation for ${requestKey}`);
    return await inFlightGenerations.get(requestKey);
  }

  const generationPromise = (async () => {
    const prompt = buildPrompt(catObj.name, topicObj.name, normalizedDifficulty, count);

    let rawContent = null;
    let providerUsed = null;
    const errorsLogged = [];

    // --- TIER 1: OpenRouter Primary ---
    try {
      console.log(`[AI Question Gen] Tier 1: Trying Primary OpenRouter (${OPENROUTER_MODEL})...`);
      rawContent = await callOpenRouter(prompt, OPENROUTER_MODEL);
      const parsed = extractJsonQuestions(rawContent);
      if (parsed && parsed.length > 0) {
        providerUsed = `OpenRouter (${OPENROUTER_MODEL})`;
      } else {
        const err = new Error("Invalid JSON returned by primary OpenRouter model");
        err.category = "invalid_json";
        throw err;
      }
    } catch (err1) {
      const cat = err1.category || categorizeError(err1);
      errorsLogged.push({ provider: "OpenRouter Primary", model: OPENROUTER_MODEL, category: cat, message: err1.message });
      console.warn(`[AI Question Gen] Tier 1 OpenRouter failed [${cat}]. Trying Tier 2 (Free Models)...`);

      // --- TIER 2: OpenRouter Free Models (Sequential Fallback) ---
      const freeModels = getOpenRouterFreeModels();
      for (const freeModel of freeModels) {
        if (providerUsed) break;
        try {
          console.log(`[AI Question Gen] Tier 2: Trying OpenRouter Free Model (${freeModel})...`);
          rawContent = await callOpenRouter(prompt, freeModel);
          const parsed = extractJsonQuestions(rawContent);
          if (parsed && parsed.length > 0) {
            providerUsed = `OpenRouter Free (${freeModel})`;
            break;
          } else {
            const err = new Error(`Invalid JSON returned by free model ${freeModel}`);
            err.category = "invalid_json";
            throw err;
          }
        } catch (freeErr) {
          const cat = freeErr.category || categorizeError(freeErr);
          errorsLogged.push({ provider: "OpenRouter Free", model: freeModel, category: cat, message: freeErr.message });
          console.warn(`[AI Question Gen] Free model ${freeModel} failed [${cat}]. Continuing...`);
        }
      }

      // --- TIER 3: Google Gemini ---
      if (!providerUsed) {
        try {
          console.log(`[AI Question Gen] Tier 3: Trying Google Gemini (${GEMINI_MODEL})...`);
          rawContent = await callGemini(prompt, GEMINI_MODEL);
          const parsed = extractJsonQuestions(rawContent);
          if (parsed && parsed.length > 0) {
            providerUsed = `Gemini (${GEMINI_MODEL})`;
          } else {
            const err = new Error("Invalid JSON returned by Gemini");
            err.category = "invalid_json";
            throw err;
          }
        } catch (geminiErr) {
          const cat = geminiErr.category || categorizeError(geminiErr);
          errorsLogged.push({ provider: "Gemini", model: GEMINI_MODEL, category: cat, message: geminiErr.message });
          console.warn(`[AI Question Gen] Tier 3 Gemini failed [${cat}]. Falling back to Tier 4 (Local DB)...`);
        }
      }
    }

    // Process parsed questions if an AI provider succeeded
    if (providerUsed && rawContent) {
      const candidateList = extractJsonQuestions(rawContent);
      if (candidateList && candidateList.length > 0) {
        const existingQuestions = await AptitudeQuestion.find({ category, topic, active: true }).select("question").lean();
        const existingSet = new Set(existingQuestions.map((q) => q.question.trim().toLowerCase()));

        const validQuestions = [];
        for (const item of candidateList) {
          if (!isValidQuestion(item, normalizedDifficulty)) continue;

          const normalizedText = item.question.trim().toLowerCase();
          if (existingSet.has(normalizedText)) {
            continue;
          }
          existingSet.add(normalizedText);

          validQuestions.push({
            category,
            topic,
            question: item.question.trim(),
            options: item.options.map((o) => ({
              key: String(o.key).trim().toUpperCase(),
              text: String(o.text).trim(),
            })),
            correctOptionKey: String(item.correctOptionKey).trim().toUpperCase(),
            explanation: String(item.explanation || "").trim(),
            difficulty: normalizedDifficulty,
            marks: 1,
            negativeMarks: 0.25,
            active: true,
            tags: ["ai-generated"],
            source: "ai",
            estimatedTimeSeconds: 60,
          });
        }

        if (validQuestions.length > 0) {
          try {
            const saved = await AptitudeQuestion.insertMany(validQuestions, { ordered: false });
            console.log(`[AI Question Gen] Saved ${saved.length} questions to DB via ${providerUsed}`);
            return { success: true, questions: saved, providerUsed, fallbackTier: "ai" };
          } catch (saveErr) {
            console.error("[AI Question Gen] Error persisting questions:", saveErr.message);
          }
        }
      }
    }

    // --- TIER 4: Local MongoDB Question Pool Fallback ---
    console.log(`[AI Question Gen] Tier 4: Fetching fallback questions from local DB pool for ${category}/${topic}...`);
    const dbPool = await AptitudeQuestion.find({ category, topic, active: true }).lean();
    if (dbPool && dbPool.length > 0) {
      return {
        success: true,
        questions: dbPool,
        providerUsed: "Local Database Question Pool",
        fallbackTier: "database",
        errors: errorsLogged,
      };
    }

    return {
      success: false,
      questions: [],
      providerUsed: null,
      error: "All AI providers failed and no local questions exist for this topic.",
      errors: errorsLogged,
    };
  })();

  inFlightGenerations.set(requestKey, generationPromise);

  try {
    return await generationPromise;
  } finally {
    inFlightGenerations.delete(requestKey);
  }
}
