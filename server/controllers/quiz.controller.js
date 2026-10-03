import mongoose from "mongoose";
import QuestionBank from "../models/questionBank.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import QuestionBankService from "../services/questionBank.service.js";

export const getQuizCategories = async (req, res) => {
  try {
    const categories = await QuestionBankService.getCategories("quiz");
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("[Quiz Controller] getQuizCategories error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve quiz categories." });
  }
};

export const startQuiz = async (req, res) => {
  try {
    const { category, difficulty, durationMinutes } = req.body;
    const userId = req.userId;

    // Fetch quiz questions matching criteria
    const questions = await QuestionBank.find({
      contentType: "quiz",
      category,
      difficulty,
      active: true,
    })
      .select("_id title description quizMetadata.options")
      .limit(15)
      .lean();

    if (!questions || questions.length === 0) {
      // Fallback: fetch any active quiz questions if specific category/difficulty has few items
      const fallbackQuestions = await QuestionBank.find({
        contentType: "quiz",
        active: true,
      })
        .select("_id title description quizMetadata.options")
        .limit(10)
        .lean();

      if (!fallbackQuestions || fallbackQuestions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No questions available for the selected quiz category.",
        });
      }
      questions.push(...fallbackQuestions);
    }

    const formattedQuestions = questions.map((q) => ({
      questionId: q._id,
      title: q.title,
      description: q.description,
      options: q.quizMetadata?.options || [],
    }));

    const attempt = await QuizAttempt.create({
      userId,
      category,
      difficulty,
      durationMinutes: durationMinutes || 15,
      totalQuestions: formattedQuestions.length,
      status: "in_progress",
      startedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        category,
        difficulty,
        durationMinutes: attempt.durationMinutes,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    console.error("[Quiz Controller] startQuiz error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to start quiz session." });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTakenSeconds } = req.body;
    const userId = req.userId;

    const attempt = await QuizAttempt.findOne({ _id: id, userId });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found." });
    }

    if (attempt.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Quiz has already been submitted or expired.",
      });
    }

    // Retrieve authoritative questions with answer keys
    const questionIds = (answers || []).map((a) => a.questionId);
    const authoritativeQuestions = await QuestionBank.find({
      _id: { $in: questionIds },
    }).lean();

    const qMap = new Map();
    authoritativeQuestions.forEach((q) => qMap.set(String(q._id), q));

    let correctCount = 0;
    const evaluatedAnswers = (answers || []).map((ans) => {
      const q = qMap.get(String(ans.questionId));
      const correctOptionKey = q?.quizMetadata?.correctOptionKey || "";
      const isCorrect = Boolean(
        ans.selectedOptionKey &&
        ans.selectedOptionKey.trim().toUpperCase() === correctOptionKey.trim().toUpperCase()
      );

      if (isCorrect) correctCount++;

      return {
        questionId: ans.questionId,
        selectedOptionKey: ans.selectedOptionKey || null,
        correctOptionKey,
        isCorrect,
        explanation: q?.quizMetadata?.explanation || "",
      };
    });

    const total = evaluatedAnswers.length || attempt.totalQuestions || 1;
    const score = Math.round((correctCount / total) * 100);
    const accuracy = Number(((correctCount / total) * 100).toFixed(1));

    attempt.answers = evaluatedAnswers;
    attempt.correctCount = correctCount;
    attempt.totalQuestions = total;
    attempt.score = score;
    attempt.accuracy = accuracy;
    attempt.timeTakenSeconds = timeTakenSeconds || 0;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        category: attempt.category,
        difficulty: attempt.difficulty,
        score,
        correctCount,
        totalQuestions: total,
        accuracy,
        timeTakenSeconds: attempt.timeTakenSeconds,
        answers: evaluatedAnswers,
      },
    });
  } catch (error) {
    console.error("[Quiz Controller] submitQuiz error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to submit quiz." });
  }
};

export const getQuizResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const attempt = await QuizAttempt.findOne({ _id: id, userId }).lean();
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Quiz result not found." });
    }

    return res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("[Quiz Controller] getQuizResult error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve quiz result." });
  }
};

export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const history = await QuizAttempt.find({ userId, status: "submitted" })
      .select("category difficulty score totalQuestions correctCount accuracy timeTakenSeconds createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("[Quiz Controller] getQuizHistory error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve quiz history." });
  }
};
