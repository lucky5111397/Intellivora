import mongoose from "mongoose";

const roundResultSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const placementSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetCompany: {
      type: String,
      required: true,
      default: "Google",
    },
    targetRole: {
      type: String,
      required: true,
      default: "Software Development Engineer",
    },
    currentRound: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    roundResults: {
      aptitude: { type: roundResultSchema, default: () => ({}) },
      coding: { type: roundResultSchema, default: () => ({}) },
      gd: { type: roundResultSchema, default: () => ({}) },
      interview: { type: roundResultSchema, default: () => ({}) },
    },
    overallStatus: {
      type: String,
      enum: ["in_progress", "completed", "failed_round", "hired"],
      default: "in_progress",
      index: true,
    },
    compositeScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedbackReport: {
      hiringDecision: { type: String, default: "Pending" },
      readinessIndex: { type: Number, default: 0 },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      roundBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true }
);

placementSessionSchema.index({ userId: 1, createdAt: -1 });

const PlacementSession = mongoose.model("PlacementSession", placementSessionSchema);

export default PlacementSession;
