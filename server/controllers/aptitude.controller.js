import mongoose from "mongoose";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import { aptitudeCategories, findCategory } from "../config/aptitudeSyllabus.js";
import {
  ensureSeedQuestions,
  listCategories,
  getProgress,
  updateProgress,
  createAttempt,
  publicAttempt,
  resultPayload,
} from "../services/aptitude.service.js";

const validOption = (value) => ["A", "B", "C", "D"].includes(value);

export const getCategories = async (req, res) => {
  try {
    await ensureSeedQuestions();
    return res.json(await listCategories(req.userId));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const getTopics = async (req, res) => {
  try {
    await ensureSeedQuestions();
    const category = findCategory(req.params.category);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const categories = await listCategories(req.userId);
    const current = categories.find((item) => item.slug === category.slug);
    return res.json({ ...category, supportedTopics: current?.supportedTopics || [], progress: current?.progress || {} });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const getProgressData = async (req, res) => {
  try {
    return res.json(await getProgress(req.userId));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const startAttempt = async (req, res) => {
  try {
    const { category, topic, difficulty, questionCount, timeLimitSeconds } = req.body;
    if (!category || !topic || !difficulty || !Number.isInteger(questionCount) || questionCount < 1 || !Number.isInteger(timeLimitSeconds) || timeLimitSeconds < 0) {
      return res.status(400).json({ message: "category, topic, difficulty, questionCount and timeLimitSeconds are required" });
    }
    await ensureSeedQuestions();
    const attempt = await createAttempt(req.userId, { category, topic, difficulty, questionCount, timeLimitSeconds });
    return res.status(201).json(publicAttempt(attempt));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const saveAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Attempt not found" });
    const { questionId, selectedOptionKey, markedForReview = false } = req.body;
    if (!mongoose.isValidObjectId(questionId) || (selectedOptionKey !== null && selectedOptionKey !== undefined && !validOption(selectedOptionKey))) return res.status(400).json({ message: "Invalid answer payload" });
    const attempt = await AptitudeAttempt.findOne({ _id: id, userId: req.userId });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.status !== "in_progress") return res.status(409).json({ message: "Attempt is no longer active" });
    const question = attempt.questions.find((item) => item.questionId.toString() === questionId.toString());
    if (!question) return res.status(400).json({ message: "Question does not belong to this attempt" });
    question.selectedOptionKey = selectedOptionKey ?? null;
    question.markedForReview = Boolean(markedForReview);
    await attempt.save();
    return res.json({ questionId, selectedOptionKey: question.selectedOptionKey, markedForReview: question.markedForReview });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Attempt not found" });
    const attempt = await AptitudeAttempt.findOne({ _id: id, userId: req.userId });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.status !== "in_progress") return res.status(409).json({ message: "Attempt has already been submitted" });
    const now = new Date();
    const elapsed = Math.max(0, Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000));
    attempt.timeTakenSeconds = attempt.timeLimitSeconds > 0 ? Math.min(elapsed, attempt.timeLimitSeconds) : elapsed;
    attempt.status = attempt.timeLimitSeconds > 0 && elapsed >= attempt.timeLimitSeconds ? "expired" : "submitted";
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    let score = 0;
    for (const question of attempt.questions) {
      if (!question.selectedOptionKey) {
        question.result = "skipped";
        question.marksAwarded = 0;
        skipped += 1;
      } else if (question.selectedOptionKey === question.correctOptionKey) {
        question.result = "correct";
        question.marksAwarded = 1;
        correct += 1;
        score += 1;
      } else {
        question.result = "incorrect";
        question.marksAwarded = -0.25;
        incorrect += 1;
        score -= 0.25;
      }
    }
    attempt.correctCount = correct;
    attempt.incorrectCount = incorrect;
    attempt.skippedCount = skipped;
    attempt.score = Number(score.toFixed(2));
    attempt.accuracy = correct + incorrect ? Number(((correct / (correct + incorrect)) * 100).toFixed(1)) : 0;
    attempt.submittedAt = now;
    await attempt.save();
    await updateProgress(req.userId);
    return res.json(resultPayload(attempt));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAttempts = async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.status) filter.status = req.query.status;
    const attempts = await AptitudeAttempt.find(filter).sort({ createdAt: -1 }).select("category topic difficulty score totalMarks correctCount incorrectCount skippedCount accuracy timeTakenSeconds startedAt submittedAt status createdAt");
    return res.json(attempts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getActiveAttempt = async (req, res) => {
  try {
    const attempt = await AptitudeAttempt.findOne({ userId: req.userId, status: "in_progress" }).sort({ createdAt: -1 });
    if (!attempt) return res.status(404).json({ message: "No active attempt found" });

    if (attempt.timeLimitSeconds > 0) {
      const elapsed = Math.max(0, Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
      if (elapsed >= attempt.timeLimitSeconds) {
        attempt.status = "expired";
        await attempt.save();
        return res.status(404).json({ message: "Attempt has expired", status: "expired", attemptId: attempt._id });
      }
    }

    return res.json(publicAttempt(attempt));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttempt = async (req, res) => {
  try {
    if (req.params.id === "active") return getActiveAttempt(req, res);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Attempt not found" });
    const attempt = await AptitudeAttempt.findOne({ _id: req.params.id, userId: req.userId });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    return res.json(attempt.status === "in_progress" ? publicAttempt(attempt) : resultPayload(attempt));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttemptResult = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Attempt not found" });
    const attempt = await AptitudeAttempt.findOne({ _id: req.params.id, userId: req.userId });
    if (!attempt || !["submitted", "expired"].includes(attempt.status)) return res.status(404).json({ message: "Result not found" });
    return res.json(resultPayload(attempt));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAttempt = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Attempt not found" });
    const deleted = await AptitudeAttempt.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Attempt not found" });
    await updateProgress(req.userId);
    return res.json({ message: "Aptitude attempt deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
