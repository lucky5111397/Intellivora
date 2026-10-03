import mongoose from "mongoose";
import Interview from "../models/interview.model.js";

export const getInterviewReplay = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({ _id: id, userId }).lean();
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    // Compute aggregate metrics
    const questions = interview.questions || [];
    const totalQuestions = questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    const strengths = [];
    const improvementAreas = [];

    questions.forEach((q, idx) => {
      const score = q.score || 0;
      totalScore += score;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;

      if (score >= 80) {
        strengths.push({
          questionIndex: idx + 1,
          question: q.question,
          highlight: q.feedback || "Demonstrated strong domain competence and clarity.",
        });
      } else if (score < 70 && q.question) {
        improvementAreas.push({
          questionIndex: idx + 1,
          question: q.question,
          recommendation: q.feedback || "Elaborate with concrete STAR framework examples.",
        });
      }
    });

    const divisor = totalQuestions || 1;
    const metrics = {
      overallScore: interview.finalScore || Math.round(totalScore / divisor),
      averageConfidence: Math.round(totalConfidence / divisor),
      averageCommunication: Math.round(totalCommunication / divisor),
      averageCorrectness: Math.round(totalCorrectness / divisor),
      totalQuestions,
    };

    return res.status(200).json({
      success: true,
      data: {
        session: {
          id: interview._id,
          role: interview.role,
          experience: interview.experience,
          mode: interview.mode,
          targetCompany: interview.targetCompany,
          status: interview.status,
          date: interview.createdAt,
        },
        metrics,
        questions,
        strengths,
        improvementAreas,
      },
    });
  } catch (error) {
    console.error("[InterviewReplay Controller] getInterviewReplay error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to generate interview replay." });
  }
};

export const listReplayableInterviews = async (req, res) => {
  try {
    const userId = req.userId;
    const interviews = await Interview.find({ userId })
      .select("role experience mode targetCompany finalScore status createdAt questionCount")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error("[InterviewReplay Controller] listReplayableInterviews error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve interviews." });
  }
};
