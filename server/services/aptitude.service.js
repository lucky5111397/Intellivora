import AptitudeQuestion from "../models/aptitudeQuestion.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import AptitudeProgress from "../models/aptitudeProgress.model.js";
import { aptitudeCategories, findCategory, findTopic, categoryForTopic } from "../config/aptitudeSyllabus.js";
import localQuestions from "../../client/src/aptitude/data/aptitudeQuestions.js";
import { generateAptitudeQuestions } from "./aiQuestionGenerator.service.js";

const difficultyName = (value) => String(value || "medium").toLowerCase();

export async function ensureSeedQuestions() {
  const operations = localQuestions.map((item) => {
    const category = item.category || categoryForTopic(item.topicId) || "quantitative";
    return {
      updateOne: {
        filter: { sourceId: item.id },
        update: {
          $set: {
            sourceId: item.id,
            category,
            topic: item.topicId,
            question: item.question,
            options: item.options.map((text, index) => ({ key: String.fromCharCode(65 + index), text })),
            correctOptionKey: String.fromCharCode(65 + item.correctAnswer),
            explanation: item.explanation || "",
            difficulty: difficultyName(item.difficulty),
            marks: 1,
            negativeMarks: 0.25,
            active: true,
            tags: item.tags || [],
            source: "local-seed",
            estimatedTimeSeconds: 60,
          },
        },
        upsert: true,
      },
    };
  });
  if (operations.length) await AptitudeQuestion.bulkWrite(operations, { ordered: false });
}

export async function listCategories(userId) {
  const [counts, progress] = await Promise.all([
    AptitudeQuestion.aggregate([{ $match: { active: true } }, { $group: { _id: "$category", count: { $sum: 1 }, topics: { $addToSet: "$topic" } } }]),
    AptitudeProgress.findOne({ userId }).lean(),
  ]);
  const countMap = new Map(counts.map((item) => [item._id, item]));
  return aptitudeCategories.map((category) => ({
    ...category,
    questionCount: countMap.get(category.slug)?.count || 0,
    supportedTopics: countMap.get(category.slug)?.topics || [],
    progress: progress?.categories?.[category.slug] || { attempted: 0, correct: 0, accuracy: 0, progress: 0 },
  }));
}

export async function getProgress(userId) {
  const progress = await AptitudeProgress.findOne({ userId }).lean();
  return progress || {
    userId,
    readiness: 0,
    totals: { attempted: 0, correct: 0, accuracy: 0, progress: 0, practiceTimeSeconds: 0 },
    categories: {},
    topics: {},
  };
}

export async function updateProgress(userId) {
  const attempts = await AptitudeAttempt.find({ userId, status: { $in: ["submitted", "expired"] } }).lean();
  const totals = { attempted: 0, correct: 0, accuracy: 0, progress: 0, practiceTimeSeconds: 0 };
  const categories = {};
  const topics = {};
  for (const attempt of attempts) {
    const attempted = attempt.correctCount + attempt.incorrectCount;
    totals.attempted += attempted;
    totals.correct += attempt.correctCount;
    totals.practiceTimeSeconds += attempt.timeTakenSeconds || 0;
    const category = categories[attempt.category] ||= { attempted: 0, correct: 0, accuracy: 0, progress: 0, practiceTimeSeconds: 0 };
    category.attempted += attempted;
    category.correct += attempt.correctCount;
    category.practiceTimeSeconds += attempt.timeTakenSeconds || 0;
    const topicKey = `${attempt.category}:${attempt.topic}`;
    const topic = topics[topicKey] ||= { attempted: 0, correct: 0, accuracy: 0, progress: 0, practiceTimeSeconds: 0 };
    topic.attempted += attempted;
    topic.correct += attempt.correctCount;
    topic.practiceTimeSeconds += attempt.timeTakenSeconds || 0;
  }
  const activeCounts = await AptitudeQuestion.aggregate([{ $match: { active: true } }, { $group: { _id: { category: "$category", topic: "$topic" }, count: { $sum: 1 } } }]);
  const poolCounts = new Map(activeCounts.map((item) => [`${item._id.category}:${item._id.topic}`, item.count]));
  for (const category of Object.values(categories)) category.accuracy = category.attempted ? Number(((category.correct / category.attempted) * 100).toFixed(1)) : 0;
  for (const [key, topic] of Object.entries(topics)) {
    topic.accuracy = topic.attempted ? Number(((topic.correct / topic.attempted) * 100).toFixed(1)) : 0;
    topic.progress = poolCounts.get(key) ? Number(Math.min(100, (topic.attempted / poolCounts.get(key)) * 100).toFixed(1)) : 0;
  }
  for (const [categoryKey, category] of Object.entries(categories)) {
    const categoryPool = [...poolCounts.entries()].filter(([key]) => key.startsWith(`${categoryKey}:`)).reduce((sum, [, count]) => sum + count, 0);
    category.progress = categoryPool ? Number(Math.min(100, (category.attempted / categoryPool) * 100).toFixed(1)) : 0;
  }
  totals.accuracy = totals.attempted ? Number(((totals.correct / totals.attempted) * 100).toFixed(1)) : 0;
  const coverage = Object.values(categories).length ? Object.values(categories).reduce((sum, item) => sum + item.progress, 0) / aptitudeCategories.length : 0;
  const readiness = Number(((totals.accuracy * 0.7 + coverage * 0.3)).toFixed(1));
  const saved = await AptitudeProgress.findOneAndUpdate({ userId }, { $set: { totals, categories, topics, readiness } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  return saved.toObject();
}

export async function createAttempt(userId, config) {
  const { category, topic, difficulty = "medium", questionCount = 5, timeLimitSeconds = 600 } = config;
  const catObj = findCategory(category);
  const topicObj = findTopic(category, topic);

  if (!catObj || !topicObj) {
    const error = new Error(`Invalid aptitude category "${category}" or topic "${topic}"`);
    error.status = 400;
    throw error;
  }

  const isAdaptive = !difficulty || ["adaptive", "all"].includes(String(difficulty).toLowerCase());
  const diffFilter = isAdaptive ? {} : { difficulty: difficultyName(difficulty) };

  // 1. Query existing active questions from MongoDB
  let pool = await AptitudeQuestion.find({ category, topic, ...diffFilter, active: true }).lean();

  // 2. If insufficient, try to generate missing questions via AI
  if (pool.length < questionCount) {
    const missingCount = questionCount - pool.length;
    console.log(`[Attempt API] Requested ${questionCount} questions for ${category}/${topic}, but only ${pool.length} exist in DB. Generating ${missingCount} via AI...`);
    try {
      await generateAptitudeQuestions({
        category,
        topic,
        difficulty: isAdaptive ? "medium" : difficultyName(difficulty),
        count: missingCount,
      });
      // Re-fetch pool after AI generation
      pool = await AptitudeQuestion.find({ category, topic, ...diffFilter, active: true }).lean();
    } catch (aiErr) {
      console.warn(`[Attempt API] AI generation failed or partial: ${aiErr.message}`);
    }
  }

  // 3. If pool is still insufficient, return clear 422 error
  // 3. If pool is still insufficient and a specific difficulty was requested, fallback to topic pool
  if (pool.length < questionCount && !isAdaptive) {
    console.log(`[Attempt API] Difficulty filter '${difficulty}' had only ${pool.length} questions. Falling back to all difficulties for topic '${topic}'...`);
    pool = await AptitudeQuestion.find({ category, topic, active: true }).lean();
  }

  // If pool is still insufficient, return clear 422 error
  if (pool.length < questionCount) {
    const error = new Error(`Only ${pool.length} active questions are available for this configuration. Required: ${questionCount}.`);
    error.status = 422;
    throw error;
  }

  // 4. Select questions (shuffled)
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, questionCount);

  const attempt = await AptitudeAttempt.create({
    userId,
    category,
    topic,
    difficulty: isAdaptive ? "adaptive" : difficultyName(difficulty),
    questionCount,
    timeLimitSeconds,
    startedAt: new Date(),
    totalMarks: selectedQuestions.reduce((sum, item) => sum + (item.marks || 1), 0),
    questions: selectedQuestions.map((item) => ({
      questionId: item._id,
      questionSnapshot: item.question,
      optionsSnapshot: item.options,
      correctOptionKey: item.correctOptionKey,
      selectedOptionKey: null,
      markedForReview: false,
      result: "skipped",
      marksAwarded: 0,
      explanationSnapshot: item.explanation || "",
    })),
  });

  return attempt;
}

export const publicAttempt = (attempt) => ({
  attemptId: attempt._id,
  category: attempt.category,
  topic: attempt.topic,
  difficulty: attempt.difficulty,
  questionCount: attempt.questionCount,
  timeLimitSeconds: attempt.timeLimitSeconds,
  startedAt: attempt.startedAt,
  status: attempt.status,
  questions: attempt.questions.map((item, index) => ({
    questionId: item.questionId,
    index,
    question: item.questionSnapshot,
    options: item.optionsSnapshot,
    selectedOptionKey: item.selectedOptionKey || null,
    markedForReview: Boolean(item.markedForReview),
  })),
});

export function resultPayload(attempt) {
  const accuracy = attempt.accuracy || 0;
  let strengths = [];
  let weaknesses = [];

  if (accuracy >= 80) {
    strengths = ["Exceptional accuracy and precision", "Strong conceptual mastery of this domain", "High question solving efficiency"];
    weaknesses = ["Maintain consistency across more complex time-pressured endurance tests"];
  } else if (accuracy >= 60) {
    strengths = ["Solid foundation on core problems", "Decent time allocation per question"];
    weaknesses = ["Accuracy drops on multi-step and edge-case questions", "Revisit explanations for incorrect answers to close knowledge gaps"];
  } else {
    strengths = ["Practice drill attempted", "Identified areas requiring targeted revision"];
    weaknesses = ["Fundamental principles require concept review", "Practice with untimed drills before high-speed sprints", "Review all missed explanations"];
  }

  return {
    attemptId: attempt._id,
    category: attempt.category,
    topic: attempt.topic,
    difficulty: attempt.difficulty,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    accuracy: attempt.accuracy,
    correct: attempt.correctCount,
    incorrect: attempt.incorrectCount,
    skipped: attempt.skippedCount,
    timeTakenSeconds: attempt.timeTakenSeconds,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    status: attempt.status,
    strengths,
    weaknesses,
    questions: attempt.questions.map((item, index) => ({
      questionNumber: index + 1,
      question: item.questionSnapshot,
      options: item.optionsSnapshot,
      selectedAnswer: item.selectedOptionKey,
      correctAnswer: item.correctOptionKey,
      result: item.result,
      explanation: item.explanationSnapshot,
    })),
  };
}
