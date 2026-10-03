import QuestionBankService from "../services/questionBank.service.js";
import SqlExecutionService from "../services/sqlExecution.service.js";
import ProblemSubmission from "../models/problemSubmission.model.js";
import UserCodingProgress from "../models/userCodingProgress.model.js";
import mongoose from "mongoose";

export const getSqlProblems = async (req, res) => {
  try {
    const { difficulty, category, search, page, limit } = req.query;
    const result = await QuestionBankService.listQuestions({
      contentType: "sql",
      difficulty,
      category,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[SQL Controller] getSqlProblems error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to list SQL problems." });
  }
};

export const getSqlProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await QuestionBankService.getQuestionBySlug(slug, false);

    if (!problem || problem.contentType !== "sql") {
      return res.status(404).json({ success: false, message: "SQL problem not found." });
    }

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error("[SQL Controller] getSqlProblemBySlug error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve SQL problem." });
  }
};

export const executeSql = async (req, res) => {
  try {
    const { slug } = req.params;
    const { query } = req.body;
    const userId = req.userId;

    const executionResult = await SqlExecutionService.executeSql({ slug, query });

    // If accepted and user is authenticated and database connected, update submission and progress
    if (mongoose.connection.readyState === 1 && userId) {
      try {
        const question = await QuestionBankService.getQuestionBySlug(slug, false);
        if (question) {
          await ProblemSubmission.create({
            userId,
            questionId: question._id,
            slug,
            language: "sql",
            code: query,
            status: executionResult.status,
            passedTestCases: executionResult.status === "ACCEPTED" ? 1 : 0,
            totalTestCases: 1,
            executionTimeMs: executionResult.executionTimeMs,
          });

          if (executionResult.status === "ACCEPTED") {
            let progress = await UserCodingProgress.findOne({ userId });
            if (!progress) {
              progress = new UserCodingProgress({ userId });
            }
            if (!progress.solvedProblemSlugs.includes(slug)) {
              progress.solvedProblemSlugs.push(slug);
              if (question.difficulty === "easy") progress.easyCount++;
              else if (question.difficulty === "medium") progress.mediumCount++;
              else if (question.difficulty === "hard") progress.hardCount++;
            }
            progress.lastSolvedAt = new Date();
            await progress.save();
          }
        }
      } catch (logErr) {
        console.warn("[SQL Controller] logging warning:", logErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: executionResult,
    });
  } catch (error) {
    console.error("[SQL Controller] executeSql error:", error.message);
    const isSecurityGuard = error.message.includes("prohibited") || error.message.includes("SELECT queries");
    return res.status(isSecurityGuard ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to execute SQL query.",
    });
  }
};
