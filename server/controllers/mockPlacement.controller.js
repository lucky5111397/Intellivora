import mongoose from "mongoose";
import PlacementSession from "../models/placementSession.model.js";

const ROUND_KEYS = {
  1: "aptitude",
  2: "coding",
  3: "gd",
  4: "interview",
};

const ROUND_WEIGHTS = {
  aptitude: 0.2,
  coding: 0.35,
  gd: 0.2,
  interview: 0.25,
};

export const startPlacementDrive = async (req, res) => {
  try {
    const { targetCompany, targetRole } = req.body;
    const userId = req.userId;

    const session = await PlacementSession.create({
      userId,
      targetCompany: targetCompany || "Google",
      targetRole: targetRole || "Software Development Engineer",
      currentRound: 1,
      overallStatus: "in_progress",
    });

    return res.status(201).json({
      success: true,
      data: session,
      message: `Placement Drive started for ${session.targetCompany}. Proceed to Round 1: Online Aptitude Test.`,
    });
  } catch (error) {
    console.error("[Placement Controller] startPlacementDrive error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to initiate placement drive." });
  }
};

export const getPlacementState = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const session = await PlacementSession.findOne({ _id: id, userId }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: "Placement drive session not found." });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("[Placement Controller] getPlacementState error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve session." });
  }
};

export const submitRound = async (req, res) => {
  try {
    const { id, roundNum } = req.params;
    const { score, details } = req.body;
    const userId = req.userId;

    const num = Number(roundNum);
    const roundKey = ROUND_KEYS[num];
    if (!roundKey) {
      return res.status(400).json({ success: false, message: "Invalid round number. Must be 1, 2, 3, or 4." });
    }

    const session = await PlacementSession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Placement session not found." });
    }

    const passed = Number(score) >= 60;
    session.roundResults[roundKey] = {
      score: Number(score),
      passed,
      completedAt: new Date(),
      details: details || {},
    };

    if (!passed) {
      session.overallStatus = "failed_round";
      session.feedbackReport.hiringDecision = "Rejected at Round " + num;
      session.feedbackReport.weaknesses.push(`Struggled in ${roundKey.toUpperCase()} evaluation (Score: ${score}%).`);
    } else {
      if (num < 4) {
        session.currentRound = num + 1;
      } else {
        // Complete placement drive & compute composite score
        const aptScore = session.roundResults.aptitude?.score || 0;
        const codScore = session.roundResults.coding?.score || 0;
        const gdScore = session.roundResults.gd?.score || 0;
        const intScore = session.roundResults.interview?.score || 0;

        const composite = Math.round(
          aptScore * ROUND_WEIGHTS.aptitude +
          codScore * ROUND_WEIGHTS.coding +
          gdScore * ROUND_WEIGHTS.gd +
          intScore * ROUND_WEIGHTS.interview
        );

        session.compositeScore = composite;
        session.overallStatus = composite >= 75 ? "hired" : "completed";

        const hiringDecision = composite >= 85
          ? "Strong Hire (Top 5% Candidate)"
          : composite >= 75
          ? "Hire (Met Technical Bar)"
          : "Borderline / Needs Additional Practice";

        session.feedbackReport = {
          hiringDecision,
          readinessIndex: composite,
          strengths: [
            codScore >= 75 ? "Strong algorithmic and coding foundations" : null,
            intScore >= 75 ? "Articulate communication and technical reasoning" : null,
            gdScore >= 75 ? "Effective collaborative problem solving" : null,
            aptScore >= 75 ? "High analytical speed and precision" : null,
          ].filter(Boolean),
          weaknesses: [
            codScore < 70 ? "Practice more complex edge cases in DSA" : null,
            intScore < 70 ? "Structure answers more clearly using STAR framework" : null,
            gdScore < 70 ? "Take stronger initiative in group discussions" : null,
            aptScore < 70 ? "Revise quantitative aptitude shortcuts" : null,
          ].filter(Boolean),
          roundBreakdown: {
            aptitude: aptScore,
            coding: codScore,
            gd: gdScore,
            interview: intScore,
          },
        };
      }
    }

    await session.save();

    return res.status(200).json({
      success: true,
      data: session,
      message: passed
        ? num < 4
          ? `Round ${num} passed! Advance to Round ${num + 1}.`
          : "Congratulations! Placement simulation complete."
        : `Round ${num} score did not meet the 60% qualification cutoff.`,
    });
  } catch (error) {
    console.error("[Placement Controller] submitRound error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to submit round result." });
  }
};

export const getPlacementReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const session = await PlacementSession.findOne({ _id: id, userId }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionSummary: {
          id: session._id,
          targetCompany: session.targetCompany,
          targetRole: session.targetRole,
          overallStatus: session.overallStatus,
          compositeScore: session.compositeScore,
          createdAt: session.createdAt,
        },
        roundResults: session.roundResults,
        feedbackReport: session.feedbackReport,
      },
    });
  } catch (error) {
    console.error("[Placement Controller] getPlacementReport error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve placement report." });
  }
};

export const listPlacementSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const sessions = await PlacementSession.find({ userId })
      .select("targetCompany targetRole currentRound overallStatus compositeScore createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("[Placement Controller] listPlacementSessions error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to list placement sessions." });
  }
};
