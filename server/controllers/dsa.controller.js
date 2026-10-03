import QuestionBankService from "../services/questionBank.service.js";
import DsaExecutionService from "../services/dsaExecution.service.js";
import MistakeBankService from "../services/mistakeBank.service.js";

export const getDsaProblems = async (req, res) => {
  try {
    const query = { ...req.query, contentType: "dsa" };
    const result = await QuestionBankService.listQuestions(query);
    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[DSA Controller] getDsaProblems error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve DSA problems." });
  }
};

export const getDsaProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await QuestionBankService.getQuestionBySlug(slug, false);

    if (!problem || !["dsa", "coding"].includes(problem.contentType)) {
      return res.status(404).json({ success: false, message: "Coding problem not found." });
    }

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error("[DSA Controller] getDsaProblemBySlug error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve problem details." });
  }
};

export const runSampleCode = async (req, res) => {
  try {
    const { slug } = req.params;
    const { language, code, customInput } = req.body;

    const result = await DsaExecutionService.runSampleCode({
      slug,
      language,
      code,
      customInput,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[DSA Controller] runSampleCode error:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || "Code execution failed." });
  }
};

export const submitCode = async (req, res) => {
  try {
    const { slug } = req.params;
    const { language, code } = req.body;
    const userId = req.userId;

    const result = await DsaExecutionService.submitCode({
      userId,
      slug,
      language,
      code,
    });

    if (result && result.status !== "ACCEPTED") {
      MistakeBankService.recordMistake(userId, {
        sourceModule: "dsa",
        questionSlug: slug,
        questionTitle: result.title || slug.replace(/-/g, " "),
        category: result.category || "DSA",
        difficulty: result.difficulty || "medium",
        tags: result.tags || [],
        userAnswer: `Status: ${result.status} (${result.passedTestCases || 0}/${result.totalTestCases || 0} passed)`,
        expectedAnswer: "All test cases passed (ACCEPTED)",
        explanation: result.failedTestCase
          ? `Failed test case: input ${JSON.stringify(result.failedTestCase.input)}. Expected output: ${JSON.stringify(result.failedTestCase.expectedOutput)}, Received: ${JSON.stringify(result.failedTestCase.actualOutput || result.stderr || "")}`
          : `Verdict: ${result.status}. Error: ${result.stderr || result.compileOutput || "Check constraints"}`,
      }).catch((err) => console.warn("[MistakeBank] Auto-record DSA mistake error:", err.message));
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[DSA Controller] submitCode error:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || "Code submission failed." });
  }
};

export const getSubmissionHistory = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    const history = await DsaExecutionService.getSubmissionHistory(userId, slug);
    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("[DSA Controller] getSubmissionHistory error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve submission history." });
  }
};

export const getUserCodingProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const progress = await DsaExecutionService.getUserProgress(userId);

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("[DSA Controller] getUserCodingProgress error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve coding progress." });
  }
};

export const getDsaAiHint = async (req, res) => {
  try {
    const { slug } = req.params;
    const { level, currentCode } = req.body;
    const userId = req.userId;

    const result = await DsaExecutionService.getProgressiveHint({
      userId,
      slug,
      level,
      currentCode,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[DSA Controller] getDsaAiHint error:", error.message);
    const status = error.statusCode || (error.message.includes("Insufficient") ? 402 : 500);
    return res.status(status).json({ success: false, message: error.message || "Failed to generate hint." });
  }
};
