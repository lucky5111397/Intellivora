import mongoose from "mongoose";
import QuestionBankService from "./questionBank.service.js";
import ProblemSubmission from "../models/problemSubmission.model.js";
import UserCodingProgress from "../models/userCodingProgress.model.js";
import CreditLedgerService from "./creditLedger.service.js";
import AiGatewayService from "./aiGateway.service.js";
import { MockSafeExecutionAdapter } from "./codeExecution/mockSafe.adapter.js";
import { PistonExecutionAdapter } from "./codeExecution/piston.adapter.js";

export class DsaExecutionService {
  static getAdapter() {
    if (process.env.CODE_EXECUTION_ADAPTER === "piston" || process.env.PISTON_URL) {
      return new PistonExecutionAdapter({
        endpoint: process.env.PISTON_URL || "https://emkc.org/api/v2/piston",
      });
    }
    return new MockSafeExecutionAdapter();
  }

  /**
   * Runs code against sample test cases or custom candidate input.
   */
  static async runSampleCode({ slug, language, code, customInput }) {
    const question = await QuestionBankService.getAuthoritativeQuestion(slug);
    if (!question) {
      throw new Error(`Problem not found with slug: ${slug}`);
    }

    const adapter = this.getAdapter();

    // If custom input provided, execute single run
    if (customInput !== undefined && customInput !== null && customInput.trim().length > 0) {
      const result = await adapter.execute({
        language,
        code,
        stdin: customInput,
        timeoutMs: question.dsaMetadata?.timeLimitMs || 3000,
      });

      return {
        mode: "custom",
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: result.executionTimeMs,
        memoryKb: result.memoryKb,
      };
    }

    // Run against sample test cases
    const sampleCases = question.dsaMetadata?.sampleTestCases || [];
    const results = [];

    for (let i = 0; i < sampleCases.length; i++) {
      const tc = sampleCases[i];
      const result = await adapter.execute({
        language,
        code,
        stdin: tc.input,
        timeoutMs: question.dsaMetadata?.timeLimitMs || 3000,
      });

      const actualTrimmed = (result.stdout || "").trim();
      const expectedTrimmed = (tc.expectedOutput || "").trim();
      const passed = result.status === "ACCEPTED" && actualTrimmed === expectedTrimmed;

      results.push({
        caseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: result.stdout,
        status: passed ? "PASSED" : result.status === "ACCEPTED" ? "FAILED" : result.status,
        executionTimeMs: result.executionTimeMs,
        error: result.stderr,
      });
    }

    return {
      mode: "samples",
      total: sampleCases.length,
      passed: results.filter((r) => r.status === "PASSED").length,
      cases: results,
    };
  }

  /**
   * Authoritatively submits code against all hidden test cases.
   */
  static async submitCode({ userId, slug, language, code }) {
    const question = await QuestionBankService.getAuthoritativeQuestion(slug);
    if (!question) {
      throw new Error(`Problem not found with slug: ${slug}`);
    }

    const adapter = this.getAdapter();
    const allCases = [
      ...(question.dsaMetadata?.sampleTestCases || []),
      ...(question.dsaMetadata?.hiddenTestCases || []),
    ];

    let passedCount = 0;
    let finalStatus = "ACCEPTED";
    let firstFailure = null;
    let totalTime = 0;
    let maxMemory = 0;

    for (let i = 0; i < allCases.length; i++) {
      const tc = allCases[i];
      const result = await adapter.execute({
        language,
        code,
        stdin: tc.input,
        timeoutMs: question.dsaMetadata?.timeLimitMs || 3000,
      });

      totalTime += result.executionTimeMs || 0;
      maxMemory = Math.max(maxMemory, result.memoryKb || 0);

      const actual = (result.stdout || "").trim();
      const expected = (tc.expectedOutput || "").trim();

      if (result.status !== "ACCEPTED") {
        finalStatus = result.status;
        firstFailure = {
          caseIndex: i + 1,
          status: result.status,
          error: result.stderr || "Runtime/Execution error",
          isHidden: tc.isHidden,
        };
        break;
      }

      if (actual !== expected) {
        finalStatus = "WRONG_ANSWER";
        firstFailure = {
          caseIndex: i + 1,
          status: "WRONG_ANSWER",
          input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
          expected: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
          actual: tc.isHidden ? "[Hidden]" : actual,
          isHidden: tc.isHidden,
        };
        break;
      }

      passedCount++;
    }

    // Persist submission log if database is connected
    let submissionRecord = null;
    if (mongoose.connection.readyState === 1) {
      try {
        submissionRecord = await ProblemSubmission.create({
          userId,
          questionId: question._id,
          slug,
          language,
          code,
          status: finalStatus,
          passedTestCases: passedCount,
          totalTestCases: allCases.length,
          executionTimeMs: Math.round(totalTime / (allCases.length || 1)),
          memoryKb: maxMemory,
          errorMessage: firstFailure?.error || null,
        });

        // Update UserCodingProgress
        let userProgress = await UserCodingProgress.findOne({ userId });
        if (!userProgress) {
          userProgress = new UserCodingProgress({ userId });
        }

        if (!userProgress.attemptedProblemSlugs.includes(slug)) {
          userProgress.attemptedProblemSlugs.push(slug);
        }

        if (finalStatus === "ACCEPTED") {
          if (!userProgress.solvedProblemSlugs.includes(slug)) {
            userProgress.solvedProblemSlugs.push(slug);
            if (question.difficulty === "easy") userProgress.easyCount++;
            else if (question.difficulty === "medium") userProgress.mediumCount++;
            else if (question.difficulty === "hard") userProgress.hardCount++;
          }
          userProgress.lastSolvedAt = new Date();
        }

        await userProgress.save();
      } catch (err) {
        console.error("[DsaExecutionService] submission persistence warning:", err.message);
      }
    }

    return {
      submissionId: submissionRecord?._id || "local-test",
      status: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: allCases.length,
      averageTimeMs: Math.round(totalTime / (allCases.length || 1)),
      memoryKb: maxMemory,
      failureDetail: firstFailure,
    };
  }

  /**
   * Generates progressive AI hint for candidate, deducting 5 credits.
   */
  static async getProgressiveHint({ userId, slug, level = 1, currentCode }) {
    const question = await QuestionBankService.getAuthoritativeQuestion(slug);
    if (!question) {
      throw new Error(`Problem not found with slug: ${slug}`);
    }

    // Deduct 5 credits for AI Hint assistance
    const HINT_COST = 5;
    if (mongoose.connection.readyState === 1 && userId) {
      const deduction = await CreditLedgerService.recordUsage({
        userId,
        amount: HINT_COST,
        feature: "dsa_hint",
        metadata: { slug, level },
      });
      if (!deduction.success) {
        throw new Error(deduction.message || "Insufficient credits for AI Hint.");
      }
    }

    // Static curated hints if present
    const curatedHints = question.dsaMetadata?.hints || [];
    if (curatedHints.length >= level && !currentCode) {
      return {
        level,
        hint: curatedHints[level - 1],
        type: "curated",
        remainingCredits: undefined,
      };
    }

    // If dynamic AI hint requested or candidate provided code
    try {
      const prompt = `You are an expert algorithmic coding mentor.
Problem: "${question.title}" (${question.difficulty})
Description: ${question.description}
Candidate's Current Code:
\`\`\`
${currentCode || "No code written yet."}
\`\`\`

Request: Provide Hint Level ${level} of 3:
- Level 1: Gentle conceptual nudge / optimal data structure recommendation without giving away the algorithm.
- Level 2: Algorithmic walkthrough / invariant explanation without giving away full code.
- Level 3: Edge cases, pseudocode, and time/space complexity breakdown.

Provide ONLY the helpful guidance, no full solutions or markdown headers.`;

      const aiResponse = await AiGatewayService.generateText({
        task: "dsa_hint",
        prompt,
      });

      return {
        level,
        hint: aiResponse.text || curatedHints[0] || "Consider using a hash map to store seen elements for O(1) lookups.",
        type: "ai_generated",
      };
    } catch {
      return {
        level,
        hint: curatedHints[level - 1] || "Think about the relationship between target, current number, and past seen numbers.",
        type: "fallback",
      };
    }
  }

  /**
   * Retrieves user's coding stats & submission history.
   */
  static async getUserProgress(userId) {
    if (mongoose.connection.readyState !== 1) {
      return {
        solvedCount: 0,
        attemptedCount: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        solvedProblems: [],
      };
    }

    const progress = await UserCodingProgress.findOne({ userId }).lean();
    if (!progress) {
      return {
        solvedCount: 0,
        attemptedCount: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        solvedProblems: [],
      };
    }

    return {
      solvedCount: progress.solvedProblemSlugs.length,
      attemptedCount: progress.attemptedProblemSlugs.length,
      easy: progress.easyCount,
      medium: progress.mediumCount,
      hard: progress.hardCount,
      solvedProblems: progress.solvedProblemSlugs,
    };
  }

  static async getSubmissionHistory(userId, slug) {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    return ProblemSubmission.find({ userId, slug })
      .select("language status passedTestCases totalTestCases executionTimeMs createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }
}

export default DsaExecutionService;
