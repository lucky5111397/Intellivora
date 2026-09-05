import mongoose from "mongoose";
import Interview from "../models/interview.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import { findCategory, findTopic } from "../config/aptitudeSyllabus.js";
import { updateProgress } from "../services/aptitude.service.js";

export const getUnifiedHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const [interviews, aptitudeAttempts] = await Promise.all([
      Interview.find({ userId }).sort({ createdAt: -1 }).lean(),
      AptitudeAttempt.find({ userId, status: { $in: ["submitted", "expired"] } }).sort({ createdAt: -1 }).lean(),
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

    const combined = [...normalizedInterviews, ...normalizedAptitude].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

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
    } else {
      return res.status(400).json({ message: "Invalid history item type" });
    }
  } catch (error) {
    console.error("[History API] Error deleting history item:", error);
    return res.status(500).json({ message: error.message });
  }
};

