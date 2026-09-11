import mongoose from "mongoose";
import GDSession from "../models/gdSession.model.js";
import User from "../models/user.model.js";
import { GD_CREDIT_COST } from "../config/credits.config.js";
import {
  defaultAICaller,
  selectNextSpeaker,
  generateOpeningTurn,
  generateAgentTurn,
  estimateSpokenDurationSeconds,
  isDiscussionComplete,
} from "../services/gdOrchestrator.service.js";
import { evaluateGDSession } from "../services/gdEvaluation.service.js";

// Allow AI caller injection for deterministic testing
let currentAICaller = defaultAICaller;

export const setAICaller = (fn) => {
  currentAICaller = fn;
};

export const resetAICaller = () => {
  currentAICaller = defaultAICaller;
};

const VALID_CATEGORIES = [
  "Technology & AI",
  "Business & Economics",
  "Social & Ethical",
  "Case Studies",
  "Custom",
];

const VALID_DIFFICULTIES = ["entry", "mid", "executive"];

/**
 * Initializes a new GD session and atomically deducts credits.
 * Safe against concurrent duplicate submissions via idempotencyKey.
 * POST /api/gd/session/create
 */
export const createSession = async (req, res, next) => {
  try {
    const {
      idempotencyKey,
      topic,
      category,
      difficulty = "mid",
      durationMinutes = 10,
      maxTurns = 30,
    } = req.body;

    // 1. Validation
    if (!idempotencyKey || typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
      return res.status(400).json({
        success: false,
        message: "Idempotency key is required.",
      });
    }

    if (!topic || typeof topic !== "string" || topic.trim().length < 5 || topic.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: "Topic must be a string between 5 and 300 characters.",
      });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(", ")}`,
      });
    }

    if (
      durationMinutes !== undefined &&
      (typeof durationMinutes !== "number" || durationMinutes < 3 || durationMinutes > 30)
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 3 and 30 minutes.",
      });
    }

    if (
      maxTurns !== undefined &&
      (typeof maxTurns !== "number" || maxTurns < 5 || maxTurns > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Max turns must be between 5 and 50.",
      });
    }

    const cleanKey = idempotencyKey.trim();

    // 2. Pre-check for existing idempotent session
    const existingSession = await GDSession.findOne({
      userId: req.userId,
      idempotencyKey: cleanKey,
    });

    if (existingSession) {
      const user = await User.findById(req.userId).select("credits");
      return res.status(200).json({
        success: true,
        sessionId: existingSession._id,
        status: existingSession.status,
        creditsLeft: user?.credits ?? 0,
        session: existingSession,
      });
    }

    // 3. Atomically check and deduct user credits
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: GD_CREDIT_COST } },
      { $inc: { credits: -GD_CREDIT_COST } },
      { new: true }
    );

    if (!updatedUser) {
      const user = await User.findById(req.userId).select("credits");
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You need at least ${GD_CREDIT_COST} credits to start a Group Discussion.`,
        creditsLeft: user?.credits ?? 0,
      });
    }

    // 4. Create the GDSession document
    try {
      const session = await GDSession.create({
        userId: req.userId,
        idempotencyKey: cleanKey,
        topic: topic.trim(),
        category,
        difficulty,
        durationMinutes,
        maxTurns,
        creditsDeducted: GD_CREDIT_COST,
        status: "setup",
      });

      return res.status(201).json({
        success: true,
        sessionId: session._id,
        status: session.status,
        creditsLeft: updatedUser.credits,
        session,
      });
    } catch (createError) {
      // Safe concurrent duplicate handling: if unique index on (userId, idempotencyKey) fails
      if (createError.code === 11000) {
        // Refund duplicate deduction
        await User.findByIdAndUpdate(req.userId, { $inc: { credits: GD_CREDIT_COST } });
        const concurrentSession = await GDSession.findOne({
          userId: req.userId,
          idempotencyKey: cleanKey,
        });
        if (concurrentSession) {
          const user = await User.findById(req.userId).select("credits");
          return res.status(200).json({
            success: true,
            sessionId: concurrentSession._id,
            status: concurrentSession.status,
            creditsLeft: user?.credits ?? 0,
            session: concurrentSession,
          });
        }
      }

      // If other schema/db error occurs, refund credits to preserve balance
      await User.findByIdAndUpdate(req.userId, { $inc: { credits: GD_CREDIT_COST } });
      throw createError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves full session details with strict user ownership isolation.
 * GET /api/gd/session/:id
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format.",
      });
    }

    const session = await GDSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    // Strict ownership isolation
    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to access this session.",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves aggregate overview metrics for Screen 1 (/gd).
 * GET /api/gd/overview
 */
export const getOverview = async (req, res, next) => {
  try {
    const sessions = await GDSession.find({ userId: req.userId })
      .select("status evaluation.overallScore evaluation.breakdown topic category difficulty durationMinutes createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const completedSessions = sessions.filter(
      (s) => s.status === "completed" && s.evaluation?.overallScore != null
    );

    const totalCompleted = completedSessions.length;
    const averageScore =
      totalCompleted > 0
        ? Math.round(
            completedSessions.reduce(
              (acc, s) => acc + (s.evaluation?.overallScore || 0),
              0
            ) / totalCompleted
          )
        : 0;

    const dimensionAverages = {
      articulation: 0,
      leadership: 0,
      listening: 0,
      criticalThinking: 0,
    };

    if (totalCompleted > 0) {
      for (const s of completedSessions) {
        const b = s.evaluation?.breakdown || {};
        dimensionAverages.articulation += b.articulation || 0;
        dimensionAverages.leadership += b.leadership || 0;
        dimensionAverages.listening += b.listening || 0;
        dimensionAverages.criticalThinking += b.criticalThinking || 0;
      }
      dimensionAverages.articulation = Math.round(
        dimensionAverages.articulation / totalCompleted
      );
      dimensionAverages.leadership = Math.round(
        dimensionAverages.leadership / totalCompleted
      );
      dimensionAverages.listening = Math.round(
        dimensionAverages.listening / totalCompleted
      );
      dimensionAverages.criticalThinking = Math.round(
        dimensionAverages.criticalThinking / totalCompleted
      );
    }

    let topDimension = "None";
    if (totalCompleted > 0) {
      const labels = {
        articulation: "Articulation & Clarity",
        leadership: "Leadership & Initiative",
        listening: "Active Listening",
        criticalThinking: "Critical Thinking",
      };
      const highestKey = Object.keys(dimensionAverages).reduce((a, b) =>
        dimensionAverages[a] >= dimensionAverages[b] ? a : b
      );
      topDimension = labels[highestKey] || highestKey;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalCompleted,
        averageScore,
        topDimension,
        dimensionAverages,
      },
      recentSessions: sessions.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Signals that the candidate completed lobby diagnostics and enters the live room.
 * POST /api/gd/session/:id/lobby-ready
 */
export const setLobbyReady = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format.",
      });
    }

    const session = await GDSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to modify this session.",
      });
    }

    // State transition guard: must be in setup or lobby
    if (!["setup", "lobby"].includes(session.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot enter live room from status '${session.status}'.`,
      });
    }

    session.status = "in_progress";
    await session.save();

    return res.status(200).json({
      success: true,
      status: "in_progress",
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submits candidate speech or triggers the next AI agent turn in the discussion.
 * POST /api/gd/session/:id/turn
 */
export const submitTurn = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format.",
      });
    }

    const session = await GDSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to access this session.",
      });
    }

    // State transition guard: must be in_progress
    if (session.status !== "in_progress") {
      return res.status(409).json({
        success: false,
        message: `Session is not in progress. Current status: '${session.status}'.`,
      });
    }

    const {
      turnType = "agent_prompt",
      content,
      durationSeconds,
      interruptedPrevious = false,
    } = req.body;

    if (!["candidate_speech", "agent_prompt"].includes(turnType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid turnType. Must be 'candidate_speech' or 'agent_prompt'.",
      });
    }

    // -------------------------------------------------------------
    // Branch 1: Candidate Speech
    // -------------------------------------------------------------
    if (turnType === "candidate_speech") {
      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content is required for candidate speech.",
        });
      }

      if (content.trim().length > 4000) {
        return res.status(400).json({
          success: false,
          message: "Turn content cannot exceed 4000 characters.",
        });
      }

      // Check if session is already completed before candidate speaks
      if (
        isDiscussionComplete({
          transcript: session.transcript,
          maxTurns: session.maxTurns,
          durationMinutes: session.durationMinutes,
          elapsedTimeSeconds: session.telemetry.totalSessionDurationSeconds,
        })
      ) {
        return res.status(200).json({
          success: true,
          isDiscussionComplete: true,
          message: "Discussion has reached maximum turns or duration limit.",
        });
      }

      const candidateDuration =
        typeof durationSeconds === "number" && durationSeconds >= 0
          ? durationSeconds
          : estimateSpokenDurationSeconds(content);

      const candidateTurn = {
        turnNumber: session.transcript.length + 1,
        speakerId: "candidate",
        speakerLabel: "You",
        personaRole: "candidate",
        content: content.trim(),
        timestamp: new Date(),
        durationSeconds: candidateDuration,
        interruptedPrevious: Boolean(interruptedPrevious),
      };

      const updatedTranscript = [...session.transcript, candidateTurn];
      const newTotalSessionSeconds =
        session.telemetry.totalSessionDurationSeconds + candidateDuration;

      // Check if discussion concludes after candidate's turn
      const completeAfterCandidate = isDiscussionComplete({
        transcript: updatedTranscript,
        maxTurns: session.maxTurns,
        durationMinutes: session.durationMinutes,
        elapsedTimeSeconds: newTotalSessionSeconds,
      });

      if (completeAfterCandidate) {
        session.transcript.push(candidateTurn);
        session.telemetry.candidateSpeakingTimeSeconds += candidateDuration;
        session.telemetry.candidateTurnCount += 1;
        session.telemetry.totalTurnsCount = session.transcript.length;
        session.telemetry.totalSessionDurationSeconds = newTotalSessionSeconds;
        if (interruptedPrevious) {
          session.telemetry.interruptionsCount += 1;
        }
        session.activeSpeakerId = "candidate";
        await session.save();

        return res.status(200).json({
          success: true,
          turn: candidateTurn,
          candidateTurn,
          isDiscussionComplete: true,
        });
      }

      // An AI peer responds to candidate's contribution
      const nextSpeaker = selectNextSpeaker({
        transcript: updatedTranscript,
        maxTurns: session.maxTurns,
      });

      try {
        const agentTurn = await generateAgentTurn({
          topic: session.topic,
          category: session.category,
          difficulty: session.difficulty,
          transcript: updatedTranscript,
          targetAgentId: nextSpeaker.speakerId,
          promptCandidate: nextSpeaker.promptCandidate,
          aiCaller: currentAICaller,
        });

        // Atomically append both candidate and agent turns
        session.transcript.push(candidateTurn);
        session.transcript.push(agentTurn);

        session.telemetry.candidateSpeakingTimeSeconds += candidateDuration;
        session.telemetry.candidateTurnCount += 1;
        if (interruptedPrevious) {
          session.telemetry.interruptionsCount += 1;
        }

        // Update agent metrics
        if (agentTurn.speakerId === "agent_1") {
          session.telemetry.agent1SpeakingTimeSeconds += agentTurn.durationSeconds;
        } else if (agentTurn.speakerId === "agent_2") {
          session.telemetry.agent2SpeakingTimeSeconds += agentTurn.durationSeconds;
        } else if (agentTurn.speakerId === "agent_3") {
          session.telemetry.agent3SpeakingTimeSeconds += agentTurn.durationSeconds;
        }

        session.telemetry.totalTurnsCount = session.transcript.length;
        session.telemetry.totalSessionDurationSeconds =
          newTotalSessionSeconds + agentTurn.durationSeconds;
        session.activeSpeakerId = agentTurn.speakerId;

        await session.save();

        const isComplete = isDiscussionComplete({
          transcript: session.transcript,
          maxTurns: session.maxTurns,
          durationMinutes: session.durationMinutes,
          elapsedTimeSeconds: session.telemetry.totalSessionDurationSeconds,
        });

        return res.status(200).json({
          success: true,
          turn: agentTurn,
          candidateTurn,
          isDiscussionComplete: isComplete,
        });
      } catch (aiError) {
        console.error(
          "[GD Controller] AI agent turn generation failed:",
          aiError.message
        );
        // Do not corrupt session transcript or commit partial state
        return res.status(502).json({
          success: false,
          message:
            "AI agent failed to generate response. Session state has been preserved. Please try again.",
        });
      }
    }

    // -------------------------------------------------------------
    // Branch 2: Agent Prompt (Initial Opening Turn or Listening Turn)
    // -------------------------------------------------------------
    if (
      isDiscussionComplete({
        transcript: session.transcript,
        maxTurns: session.maxTurns,
        durationMinutes: session.durationMinutes,
        elapsedTimeSeconds: session.telemetry.totalSessionDurationSeconds,
      })
    ) {
      return res.status(200).json({
        success: true,
        isDiscussionComplete: true,
        message: "Discussion has reached maximum turns or duration limit.",
      });
    }

    // If transcript is empty, Central Orchestrator delivers opening statement
    if (session.transcript.length === 0) {
      try {
        const openingTurn = await generateOpeningTurn({
          topic: session.topic,
          category: session.category,
          difficulty: session.difficulty,
          aiCaller: currentAICaller,
        });

        session.transcript.push(openingTurn);
        session.telemetry.totalTurnsCount = session.transcript.length;
        session.telemetry.totalSessionDurationSeconds += openingTurn.durationSeconds;
        session.activeSpeakerId = "orchestrator";
        await session.save();

        return res.status(200).json({
          success: true,
          turn: openingTurn,
          isDiscussionComplete: false,
        });
      } catch (aiError) {
        console.error(
          "[GD Controller] Opening turn generation failed:",
          aiError.message
        );
        return res.status(502).json({
          success: false,
          message:
            "Failed to generate opening statement. Session state has been preserved.",
        });
      }
    }

    // Discussion already in progress: select next agent
    const nextSpeaker = selectNextSpeaker({
      transcript: session.transcript,
      maxTurns: session.maxTurns,
    });

    if (nextSpeaker.speakerId === "candidate") {
      return res.status(200).json({
        success: true,
        floorGivenToCandidate: true,
        isDiscussionComplete: false,
      });
    }

    try {
      const agentTurn = await generateAgentTurn({
        topic: session.topic,
        category: session.category,
        difficulty: session.difficulty,
        transcript: session.transcript,
        targetAgentId: nextSpeaker.speakerId,
        promptCandidate: nextSpeaker.promptCandidate,
        aiCaller: currentAICaller,
      });

      session.transcript.push(agentTurn);
      session.telemetry.totalTurnsCount = session.transcript.length;
      session.telemetry.totalSessionDurationSeconds += agentTurn.durationSeconds;

      if (agentTurn.speakerId === "agent_1") {
        session.telemetry.agent1SpeakingTimeSeconds += agentTurn.durationSeconds;
      } else if (agentTurn.speakerId === "agent_2") {
        session.telemetry.agent2SpeakingTimeSeconds += agentTurn.durationSeconds;
      } else if (agentTurn.speakerId === "agent_3") {
        session.telemetry.agent3SpeakingTimeSeconds += agentTurn.durationSeconds;
      }

      session.activeSpeakerId = agentTurn.speakerId;
      await session.save();

      const isComplete = isDiscussionComplete({
        transcript: session.transcript,
        maxTurns: session.maxTurns,
        durationMinutes: session.durationMinutes,
        elapsedTimeSeconds: session.telemetry.totalSessionDurationSeconds,
      });

      return res.status(200).json({
        success: true,
        turn: agentTurn,
        isDiscussionComplete: isComplete,
      });
    } catch (aiError) {
      console.error(
        "[GD Controller] AI agent turn generation failed:",
        aiError.message
      );
      return res.status(502).json({
        success: false,
        message:
          "AI agent failed to generate response. Session state has been preserved. Please try again.",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Concludes the discussion and triggers AI evaluation.
 * POST /api/gd/session/:id/complete
 */
export const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format.",
      });
    }

    const session = await GDSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to access this session.",
      });
    }

    // Idempotent completion check
    if (session.status === "completed" && session.evaluation) {
      return res.status(200).json({
        success: true,
        status: "completed",
        evaluation: session.evaluation,
        session,
      });
    }

    if (session.status !== "in_progress") {
      return res.status(409).json({
        success: false,
        message: `Cannot complete session with status '${session.status}'.`,
      });
    }

    // Merge client-side final telemetry if provided with authoritative bounds
    if (req.body?.finalTelemetry && typeof req.body.finalTelemetry === "object") {
      const ft = req.body.finalTelemetry;
      const maxAllowedSeconds = (session.durationMinutes || 10) * 60 + 120; // duration limit + buffer

      if (typeof ft.candidateSpeakingTimeSeconds === "number" && ft.candidateSpeakingTimeSeconds >= 0) {
        session.telemetry.candidateSpeakingTimeSeconds = Math.min(
          maxAllowedSeconds,
          Math.max(session.telemetry.candidateSpeakingTimeSeconds, ft.candidateSpeakingTimeSeconds)
        );
      }
      if (typeof ft.interruptionsCount === "number" && ft.interruptionsCount >= 0) {
        session.telemetry.interruptionsCount = Math.min(
          50,
          Math.max(session.telemetry.interruptionsCount, ft.interruptionsCount)
        );
      }
      if (typeof ft.totalSessionDurationSeconds === "number" && ft.totalSessionDurationSeconds >= 0) {
        session.telemetry.totalSessionDurationSeconds = Math.min(
          maxAllowedSeconds,
          Math.max(session.telemetry.totalSessionDurationSeconds, ft.totalSessionDurationSeconds)
        );
      }
    }

    try {
      const evaluation = await evaluateGDSession({
        session,
        aiCaller: currentAICaller,
      });

      session.evaluation = evaluation;
      session.status = "completed";
      session.activeSpeakerId = null;
      await session.save();

      return res.status(200).json({
        success: true,
        status: "completed",
        evaluation: session.evaluation,
        session,
      });
    } catch (evalError) {
      console.error("[GD Controller] Evaluation failed:", evalError.message);
      return res.status(502).json({
        success: false,
        message:
          "AI evaluation service failed. Session remains in_progress so you can retry.",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Terminates an abandoned session with automatic refund protection.
 * POST /api/gd/session/:id/abort
 */
export const abortSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format.",
      });
    }

    const session = await GDSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to modify this session.",
      });
    }

    if (session.status === "completed") {
      return res.status(409).json({
        success: false,
        message: "Completed session cannot be aborted.",
      });
    }

    if (session.status === "aborted") {
      return res.status(200).json({
        success: true,
        status: "aborted",
        refunded: Boolean(session.refunded),
        message: "Session is already aborted.",
      });
    }

    // Automatic refund rule:
    // If candidate has 0 turns and session was not previously refunded
    const candidateTurns = session.telemetry?.candidateTurnCount ?? 0;
    const shouldRefund =
      !session.refunded &&
      session.creditsDeducted > 0 &&
      candidateTurns === 0;

    let refunded = false;

    if (shouldRefund) {
      // Atomic CAS to prevent concurrent double-refund races
      const updated = await GDSession.findOneAndUpdate(
        {
          _id: id,
          status: { $ne: "completed" },
          refunded: { $ne: true },
        },
        {
          $set: {
            refunded: true,
            status: "aborted",
            activeSpeakerId: null,
          },
        },
        { new: true }
      );

      if (updated) {
        // Only the single atomic winner refunds the user
        await User.findByIdAndUpdate(session.userId, {
          $inc: { credits: session.creditsDeducted },
        });
        refunded = true;
      } else {
        const latest = await GDSession.findById(id);
        refunded = Boolean(latest?.refunded);
      }
    } else {
      await GDSession.findOneAndUpdate(
        { _id: id, status: { $ne: "completed" } },
        {
          $set: {
            status: "aborted",
            activeSpeakerId: null,
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      status: "aborted",
      refunded,
      message: refunded
        ? "Session terminated. Credits have been refunded to your account."
        : "Session terminated. Credits are non-refundable as discussion had commenced.",
    });
  } catch (error) {
    next(error);
  }
};
