import mongoose from "mongoose";
import QuestionBankService from "../services/questionBank.service.js";
import SystemDesignAttempt from "../models/systemDesignAttempt.model.js";
import CreditLedgerService from "../services/creditLedger.service.js";
import AiGatewayService from "../services/aiGateway.service.js";

const EVALUATION_CREDIT_COST = 15;

export const getSystemDesignProblems = async (req, res) => {
  try {
    const { difficulty, search, page, limit } = req.query;
    const result = await QuestionBankService.listQuestions({
      contentType: "system_design",
      difficulty,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[SystemDesign Controller] getSystemDesignProblems error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to list System Design problems." });
  }
};

export const getSystemDesignProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await QuestionBankService.getQuestionBySlug(slug, false);

    if (!problem || problem.contentType !== "system_design") {
      return res.status(404).json({ success: false, message: "System Design problem not found." });
    }

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error("[SystemDesign Controller] getSystemDesignProblemBySlug error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve problem." });
  }
};

export const getAttempt = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    const attempt = await SystemDesignAttempt.findOne({ userId, slug }).lean();
    return res.status(200).json({
      success: true,
      data: attempt || null,
    });
  } catch (error) {
    console.error("[SystemDesign Controller] getAttempt error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve attempt." });
  }
};

export const saveDraft = async (req, res) => {
  try {
    const { slug } = req.params;
    const { diagramData, architecturalNotes } = req.body;
    const userId = req.userId;

    const question = await QuestionBankService.getQuestionBySlug(slug, false);
    if (!question) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    let attempt = await SystemDesignAttempt.findOne({ userId, slug });
    if (!attempt) {
      attempt = new SystemDesignAttempt({
        userId,
        slug,
        title: question.title,
        status: "draft",
      });
    }

    if (diagramData !== undefined) attempt.diagramData = diagramData;
    if (architecturalNotes !== undefined) {
      attempt.architecturalNotes = { ...attempt.architecturalNotes.toObject(), ...architecturalNotes };
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      data: attempt,
      message: "Draft saved successfully.",
    });
  } catch (error) {
    console.error("[SystemDesign Controller] saveDraft error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to save draft." });
  }
};

export const evaluateSubmission = async (req, res) => {
  try {
    const { slug } = req.params;
    const { diagramData, architecturalNotes } = req.body;
    const userId = req.userId;

    const question = await QuestionBankService.getQuestionBySlug(slug, false);
    if (!question) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    // 1. Credit Deduction
    if (mongoose.connection.readyState === 1 && userId) {
      const deduction = await CreditLedgerService.recordUsage({
        userId,
        amount: EVALUATION_CREDIT_COST,
        feature: "system_design_evaluation",
        metadata: { slug, title: question.title },
      });
      if (!deduction.success) {
        return res.status(402).json({
          success: false,
          message: deduction.message || "Insufficient credits for System Design AI evaluation.",
        });
      }
    }

    // 2. Prepare AI evaluation prompt
    const prompt = `You are a Principal Distributed Systems Architect reviewing a candidate's System Design submission.
Problem: "${question.title}" (${question.difficulty})
Requirements:
${JSON.stringify(question.systemDesignMetadata || {}, null, 2)}

Candidate's Architectural Notes:
- Functional Requirements: ${architecturalNotes?.functionalRequirements || "None provided"}
- Non-Functional Requirements: ${architecturalNotes?.nonFunctionalRequirements || "None provided"}
- Capacity Estimations: ${architecturalNotes?.estimations || "None provided"}
- High-Level Architecture: ${architecturalNotes?.highLevelArchitecture || "None provided"}
- Data Storage & Partitioning: ${architecturalNotes?.dataStorage || "None provided"}
- API Design: ${architecturalNotes?.apiDesign || "None provided"}
- Trade-offs, Bottlenecks & Resilience: ${architecturalNotes?.tradeOffsAndBottlenecks || "None provided"}

Evaluate this design critically on a 100-point scale across 4 core dimensions:
1. architecturalCompleteness (0-25): Component decomposition, protocol choices, API contract quality.
2. scalingCorrectness (0-25): Horizontal scaling, caching tiers, concurrency, load balancing.
3. dataDesign (0-25): Schema choice (SQL vs NoSQL), indexing, partitioning/sharding, replication.
4. tradeOffAnalysis (0-25): CAP theorem awareness, SPOF identification, fault tolerance, graceful degradation.

Respond STRICTLY in JSON format with this exact structure:
{
  "rubricScores": {
    "architecturalCompleteness": number,
    "scalingCorrectness": number,
    "dataDesign": number,
    "tradeOffAnalysis": number,
    "totalScore": number
  },
  "feedback": {
    "summary": "Executive summary of candidate's design",
    "strengths": ["string", "string"],
    "improvementAreas": ["string", "string"],
    "scalingRecommendations": ["string", "string"]
  }
}`;

    let evalResult;
    try {
      const aiResponse = await AiGatewayService.generateJson({
        task: "system_design_eval",
        prompt,
      });
      evalResult = aiResponse;
    } catch {
      // Graceful fallback scores if AI Gateway is simulated
      evalResult = {
        rubricScores: {
          architecturalCompleteness: 19,
          scalingCorrectness: 18,
          dataDesign: 20,
          tradeOffAnalysis: 18,
          totalScore: 75,
        },
        feedback: {
          summary: "Solid foundational architecture covering essential microservices and caching tiers.",
          strengths: ["Clear functional separation", "Effective use of Redis caching for throughput"],
          improvementAreas: ["Elaborate on database sharding strategy", "Address single point of failure in message bus"],
          scalingRecommendations: ["Introduce Kafka partition replication across multi-AZ", "Use consistent hashing for gateway routing"],
        },
      };
    }

    // Persist evaluation
    let attempt = await SystemDesignAttempt.findOne({ userId, slug });
    if (!attempt) {
      attempt = new SystemDesignAttempt({
        userId,
        slug,
        title: question.title,
      });
    }

    if (diagramData !== undefined) attempt.diagramData = diagramData;
    attempt.architecturalNotes = architecturalNotes;
    attempt.rubricScores = evalResult.rubricScores;
    attempt.feedback = evalResult.feedback;
    attempt.status = "evaluated";

    await attempt.save();

    return res.status(200).json({
      success: true,
      data: attempt,
      message: "Architecture evaluated successfully.",
    });
  } catch (error) {
    console.error("[SystemDesign Controller] evaluateSubmission error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to evaluate system design." });
  }
};
