import mongoose from "mongoose";
import Interview from "../models/interview.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import GDSession from "../models/gdSession.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import { findCategory, findTopic } from "../config/aptitudeSyllabus.js";
import { updateProgress } from "../services/aptitude.service.js";

export const getUnifiedHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const [interviews, aptitudeAttempts, gdSessions, resumeAnalyses] = await Promise.all([
      Interview.find({ userId })
        .select("_id role experience mode targetCompany finalScore status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      AptitudeAttempt.find({ userId, status: { $in: ["submitted", "expired"] } })
        .select("_id category topic difficulty targetCompany score totalMarks accuracy correctCount incorrectCount skippedCount timeTakenSeconds status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      GDSession.find({ userId, status: "completed" })
        .select("_id topic category difficulty durationMinutes evaluation.overallScore status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      ResumeAnalysis.find({ userId })
        .select("_id targetRole experienceLevel resumeScore atsScore interviewReadinessScore strengths weaknesses missingSkills improvementSuggestions createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const normalizedInterviews = interviews.map((item) => ({
      id: item._id,
      _id: item._id,
      type: "interview",
      module: "interview",
      title: item.role || "Technical Interview",
      subtitle: `${item.experience || ""} • ${item.mode || ""}`.trim(),
      role: item.role,
      experience: item.experience,
      mode: item.mode,
      targetCompany: item.targetCompany || null,
      score: item.finalScore || 0,
      finalScore: item.finalScore || 0,
      status: (item.status || "Completed").toLowerCase(),
      createdAt: item.createdAt,
      route: `/report/${item._id}`,
    }));

    const normalizedAptitude = aptitudeAttempts.map((item) => {
      const topicObj = findTopic(item.category, item.topic);
      const catObj = findCategory(item.category);
      return {
        id: item._id,
        _id: item._id,
        type: "aptitude",
        module: "aptitude",
        title: `${topicObj?.name || item.topic} Test`,
        subtitle: catObj?.name || item.category,
        category: item.category,
        topic: item.topic,
        difficulty: item.difficulty,
        targetCompany: item.targetCompany || null,
        score: item.score || 0,
        totalMarks: item.totalMarks || 0,
        accuracy: item.accuracy || 0,
        correctCount: item.correctCount || 0,
        incorrectCount: item.incorrectCount || 0,
        skippedCount: item.skippedCount || 0,
        timeTakenSeconds: item.timeTakenSeconds || 0,
        status: item.status,
        createdAt: item.createdAt,
        route: `/aptitude/result/${item._id}`,
      };
    });

    const normalizedGD = (gdSessions || []).map((item) => ({
      id: item._id,
      _id: item._id,
      type: "gd",
      module: "gd",
      title: item.topic || "Group Discussion",
      subtitle: `${item.category || ""} • ${item.difficulty || "mid"}`.trim(),
      topic: item.topic,
      category: item.category,
      difficulty: item.difficulty,
      durationMinutes: item.durationMinutes || 10,
      score: item.evaluation?.overallScore || 0,
      finalScore: item.evaluation?.overallScore || 0,
      status: item.status || "completed",
      createdAt: item.createdAt,
      route: `/gd/analysis/${item._id}`,
    }));

    const normalizedResumes = (resumeAnalyses || []).map((item) => ({
      id: item._id,
      _id: item._id,
      type: "resume",
      module: "resume",
      title: item.targetRole ? `${item.targetRole} ATS Analysis` : "ATS Resume Analysis",
      subtitle: `${item.experienceLevel || "Target Role"} • ATS Score ${item.atsScore ?? 0}%`.trim(),
      role: item.targetRole,
      targetRole: item.targetRole,
      experienceLevel: item.experienceLevel,
      score: item.atsScore ?? item.resumeScore ?? 0,
      finalScore: item.atsScore ?? item.resumeScore ?? 0,
      resumeScore: item.resumeScore ?? 0,
      atsScore: item.atsScore ?? 0,
      interviewReadinessScore: item.interviewReadinessScore ?? 0,
      strengths: item.strengths || [],
      weaknesses: item.weaknesses || [],
      missingSkills: item.missingSkills || [],
      improvementSuggestions: item.improvementSuggestions || [],
      status: "completed",
      createdAt: item.createdAt,
      route: "/resume",
    }));

    const combined = [
      ...normalizedInterviews,
      ...normalizedAptitude,
      ...normalizedGD,
      ...normalizedResumes,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(combined);
  } catch (error) {
    console.error("[History API] Error fetching unified history:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "History item not found" });
    }

    if (type === "aptitude") {
      const deleted = await AptitudeAttempt.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ message: "Aptitude attempt not found" });
      await updateProgress(userId);
      return res.json({ message: "Aptitude attempt deleted successfully" });
    } else if (type === "interview") {
      const deleted = await Interview.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ message: "Interview not found" });
      return res.json({ message: "Interview deleted successfully" });
    } else if (type === "gd") {
      const deleted = await GDSession.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ message: "Group discussion session not found" });
      return res.json({ message: "Group discussion deleted successfully" });
    } else if (type === "resume" || type === "ats") {
      const deleted = await ResumeAnalysis.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ message: "Resume analysis record not found" });
      return res.json({ message: "Resume analysis deleted successfully" });
    } else {
      return res.status(400).json({ message: "Invalid history item type" });
    }
  } catch (error) {
    console.error("[History API] Error deleting history item:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getProgressAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    const [interviews, aptitudeAttempts, gdSessions] = await Promise.all([
      Interview.find({
        userId,
        status: { $regex: /^completed$/i },
        finalScore: { $exists: true, $ne: null },
      })
        .select("finalScore createdAt")
        .sort({ createdAt: 1 })
        .lean(),
      AptitudeAttempt.find({ userId, status: { $in: ["submitted", "expired"] } })
        .select("category topic accuracy createdAt")
        .sort({ createdAt: 1 })
        .lean(),
      GDSession.find({ userId, status: "completed", "evaluation.overallScore": { $exists: true, $ne: null } })
        .select("topic category evaluation.overallScore createdAt")
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const interviewTrend = interviews.map((item) => ({
      date: item.createdAt,
      score: typeof item.finalScore === "number" ? item.finalScore : 0,
    }));

    const aptitudeTrend = aptitudeAttempts.map((item) => {
      const topicObj = findTopic(item.category, item.topic);
      return {
        date: item.createdAt,
        accuracy: typeof item.accuracy === "number" ? item.accuracy : 0,
        topic: topicObj?.name || item.topic || "Aptitude",
      };
    });

    const gdTrend = gdSessions.map((item) => ({
      date: item.createdAt,
      overallScore: typeof item.evaluation?.overallScore === "number" ? item.evaluation.overallScore : 0,
    }));

    const computeAverage = (items, scoreGetter) => {
      if (!items || items.length === 0) return 0;
      const sum = items.reduce((acc, curr) => acc + (scoreGetter(curr) || 0), 0);
      return Number((sum / items.length).toFixed(1));
    };

    const computeBest = (items, scoreGetter) => {
      if (!items || items.length === 0) return 0;
      const values = items.map(scoreGetter);
      return Math.max(...values);
    };

    const computeImprovement = (items, scoreGetter) => {
      if (!items || items.length < 4) return null;
      const first3Avg = items.slice(0, 3).reduce((sum, i) => sum + (scoreGetter(i) || 0), 0) / 3;
      const last3Avg = items.slice(-3).reduce((sum, i) => sum + (scoreGetter(i) || 0), 0) / 3;
      if (first3Avg === 0) return last3Avg > 0 ? 100 : 0;
      return Number((((last3Avg - first3Avg) / first3Avg) * 100).toFixed(1));
    };

    const interviewImprovement = computeImprovement(interviewTrend, (i) => i.score);
    const aptitudeImprovement = computeImprovement(aptitudeTrend, (i) => i.accuracy);
    const gdImprovement = computeImprovement(gdTrend, (i) => i.overallScore);

    const activeImprovements = [interviewImprovement, aptitudeImprovement, gdImprovement].filter(
      (v) => typeof v === "number" && !Number.isNaN(v)
    );
    const overallImprovement =
      activeImprovements.length > 0
        ? Number((activeImprovements.reduce((a, b) => a + b, 0) / activeImprovements.length).toFixed(1))
        : null;

    const summaryStats = {
      totalSessions: {
        interview: interviewTrend.length,
        aptitude: aptitudeTrend.length,
        gd: gdTrend.length,
        total: interviewTrend.length + aptitudeTrend.length + gdTrend.length,
      },
      averageScore: {
        interview: computeAverage(interviewTrend, (i) => i.score),
        aptitude: computeAverage(aptitudeTrend, (i) => i.accuracy),
        gd: computeAverage(gdTrend, (i) => i.overallScore),
      },
      bestScore: {
        interview: computeBest(interviewTrend, (i) => i.score),
        aptitude: computeBest(aptitudeTrend, (i) => i.accuracy),
        gd: computeBest(gdTrend, (i) => i.overallScore),
      },
      improvementPercentage: {
        interview: interviewImprovement,
        aptitude: aptitudeImprovement,
        gd: gdImprovement,
        overall: overallImprovement,
      },
    };

    return res.json({
      interviewTrend,
      aptitudeTrend,
      gdTrend,
      summaryStats,
    });
  } catch (error) {
    console.error("[History API] Error fetching progress analytics:", error);
    return res.status(500).json({ message: error.message });
  }
};
