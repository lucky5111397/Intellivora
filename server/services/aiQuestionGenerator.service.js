import { generateStructured } from "./aiGateway.service.js";
import AptitudeQuestion from "../models/aptitudeQuestion.model.js";
import { findCategory, findTopic } from "../config/aptitudeSyllabus.js";

const inFlightGenerations = new Map();

const isValidDifficulty = (difficulty) =>
  ["easy", "medium", "hard"].includes(difficulty);

function buildPrompt(categoryName, topicName, difficulty, count) {
  return `You are a professional aptitude exam paper setter for competitive technical and corporate exams such as CAT, GATE, TCS NQT, Infosys, AMCAT, and eLitmus.

Generate exactly ${count} multiple-choice questions for:

Domain/Category: "${categoryName}"
Topic: "${topicName}"
Difficulty Level: "${difficulty.toUpperCase()}"

CRITICAL INSTRUCTIONS:
1. Every question must have exactly 4 options labeled A, B, C, and D.
2. Exactly one option must be strictly correct.
3. Set "correctOptionKey" to "A", "B", "C", or "D".
4. Provide a clear, comprehensive step-by-step explanation.
5. For quantitative and reasoning questions, provide complete numerical and logical calculations.
6. All 4 options must be distinct and non-empty strings.
7. The question must be detailed, unambiguous, and self-contained.
8. Questions must be original and non-trivial.
9. Follow the requested difficulty level strictly.
10. Output ONLY valid JSON. Do not include markdown, commentary, or a preamble.

OUTPUT FORMAT:
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
    "difficulty": "${difficulty}"
  }
]`;
}

export function isValidQuestion(question, expectedDifficulty) {
  if (!question || typeof question !== "object") {
    return false;
  }

  if (
    typeof question.question !== "string" ||
    question.question.trim().length < 15
  ) {
    return false;
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) {
    return false;
  }

  const validKeys = new Set(["A", "B", "C", "D"]);
  const seenKeys = new Set();
  const seenTexts = new Set();

  for (const option of question.options) {
    if (!option || typeof option !== "object") {
      return false;
    }

    const key = String(option.key || "").trim().toUpperCase();
    const text = String(option.text || "").trim();

    if (!validKeys.has(key) || !text) {
      return false;
    }

    if (seenKeys.has(key) || seenTexts.has(text.toLowerCase())) {
      return false;
    }

    seenKeys.add(key);
    seenTexts.add(text.toLowerCase());
  }

  if (seenKeys.size !== 4) {
    return false;
  }

  const correctOptionKey = String(
    question.correctOptionKey || ""
  )
    .trim()
    .toUpperCase();

  if (!validKeys.has(correctOptionKey)) {
    return false;
  }

  if (
    typeof question.explanation !== "string" ||
    question.explanation.trim().length < 10
  ) {
    return false;
  }

  if (
    typeof question.difficulty === "string" &&
    expectedDifficulty &&
    question.difficulty.trim().toLowerCase() !== expectedDifficulty
  ) {
    return false;
  }

  return true;
}

export function extractJsonQuestions(rawContent) {
  if (!rawContent || typeof rawContent !== "string") {
    return null;
  }

  const cleaned = rawContent
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.questions)
    ) {
      return parsed.questions;
    }

    return null;
  } catch {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

    if (!arrayMatch) {
      return null;
    }

    try {
      const parsed = JSON.parse(arrayMatch[0]);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.questions)
      ) {
        return parsed.questions;
      }
    } catch {
      return null;
    }

    return null;
  }
}

function validateGeneratedQuestions(data, expectedDifficulty) {
  const questions = Array.isArray(data)
    ? data
    : data?.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI did not return a valid array of questions.");
  }

  const validQuestions = questions.filter((question) =>
    isValidQuestion(question, expectedDifficulty)
  );

  if (validQuestions.length === 0) {
    throw new Error("AI returned no valid aptitude questions.");
  }

  return validQuestions;
}

async function persistQuestions({
  questions,
  category,
  topic,
  difficulty,
}) {
  const safeCategory = String(category || "").trim();
  const safeTopic = String(topic || "").trim();

  const existingQuestions = await AptitudeQuestion.find({
    category: safeCategory,
    topic: safeTopic,
    active: true,
  })
    .select("question")
    .lean();

  const existingSet = new Set(
    existingQuestions.map((question) =>
      question.question.trim().toLowerCase()
    )
  );

  const validQuestions = [];

  for (const item of questions) {
    const normalizedText = item.question.trim().toLowerCase();

    if (existingSet.has(normalizedText)) {
      continue;
    }

    existingSet.add(normalizedText);

    validQuestions.push({
      category,
      topic,
      question: item.question.trim(),
      options: item.options.map((option) => ({
        key: String(option.key).trim().toUpperCase(),
        text: String(option.text).trim(),
      })),
      correctOptionKey: String(item.correctOptionKey)
        .trim()
        .toUpperCase(),
      explanation: String(item.explanation || "").trim(),
      difficulty,
      marks: 1,
      negativeMarks: 0.25,
      active: true,
      tags: ["ai-generated"],
      source: "ai",
      estimatedTimeSeconds: 60,
    });
  }

  if (validQuestions.length === 0) {
    return [];
  }

  return AptitudeQuestion.insertMany(validQuestions, {
    ordered: false,
  });
}

export async function generateAptitudeQuestions({
  category,
  topic,
  difficulty = "medium",
  count = 5,
}) {
  const catObj = findCategory(category);
  const topicObj = findTopic(category, topic);

  if (!catObj || !topicObj) {
    throw new Error(`Invalid category "${category}" or topic "${topic}"`);
  }

  const normalizedDifficulty = isValidDifficulty(
    String(difficulty).toLowerCase()
  )
    ? String(difficulty).toLowerCase()
    : "medium";

  const normalizedCount = Math.max(
    1,
    Math.min(Number(count) || 5, 20)
  );

  const requestKey = `${category}:${topic}:${normalizedDifficulty}:${normalizedCount}`;

  const existingGeneration = inFlightGenerations.get(requestKey);

  if (existingGeneration) {
    return existingGeneration;
  }

  const generationPromise = (async () => {
    const prompt = buildPrompt(
      catObj.name,
      topicObj.name,
      normalizedDifficulty,
      normalizedCount
    );

    const errors = [];

    try {
      const generatedQuestions = await generateStructured({
        task: "aptitude",
        prompt,
        temperature: 0.3,
        schemaValidator: (data) =>
          validateGeneratedQuestions(
            data,
            normalizedDifficulty
          ),
      });

      const parsedQuestions = extractJsonQuestions(
        JSON.stringify(generatedQuestions)
      );

      const questions = parsedQuestions || generatedQuestions;

      const validQuestions = validateGeneratedQuestions(
        questions,
        normalizedDifficulty
      );

      const savedQuestions = await persistQuestions({
        questions: validQuestions,
        category: catObj.id,
        topic: topicObj.id,
        difficulty: normalizedDifficulty,
      });

      if (savedQuestions.length > 0) {
        return {
          success: true,
          questions: savedQuestions,
          providerUsed: "AI Gateway",
          fallbackTier: "ai",
        };
      }

      return {
        success: true,
        questions: validQuestions,
        providerUsed: "AI Gateway",
        fallbackTier: "ai",
      };
    } catch (error) {
      errors.push({
        provider: "AI Gateway",
        message: error.message,
        category: error.category || "provider_error",
      });

      console.warn(
        `[AI Question Gen] AI Gateway failed: ${error.message}. Falling back to database.`
      );
    }

    const dbPool = await AptitudeQuestion.find({
      category: catObj.id,
      topic: topicObj.id,
      active: true,
      difficulty: normalizedDifficulty,
    }).lean();

    if (dbPool.length > 0) {
      return {
        success: true,
        questions: dbPool,
        providerUsed: "Local Database Question Pool",
        fallbackTier: "database",
        errors,
      };
    }

    return {
      success: false,
      questions: [],
      providerUsed: null,
      error:
        "AI generation failed and no local questions exist for this topic.",
      errors,
    };
  })();

  inFlightGenerations.set(requestKey, generationPromise);

  try {
    return await generationPromise;
  } finally {
    inFlightGenerations.delete(requestKey);
  }
}