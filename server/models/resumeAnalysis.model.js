import mongoose from "mongoose";

/**
 * Schema for persisting ATS Resume Analysis evaluations.
 *
 * Privacy & Data Minimization:
 * To protect candidate privacy, raw extracted resume text is NOT persisted in the database.
 * Only the operational analysis results (scores, strengths, weaknesses, skills gap, suggestions)
 * and session metadata (target role, experience level, timestamp, credit cost) are retained.
 */
const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      required: true,
      trim: true,
    },
    resumeScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    interviewReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    improvementSuggestions: {
      type: [String],
      default: [],
    },
    creditsUsed: {
      type: Number,
      default: 200,
    },
  },
  { timestamps: true }
);

// Compound index for fast user history queries sorted chronologically
resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

export default ResumeAnalysis;
