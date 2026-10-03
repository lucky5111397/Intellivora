import mongoose from "mongoose";

/**
 * MistakeBank Entity Schema
 * Aggregates candidate mistakes across all platform modules (Quizzes, Aptitude,
 * DSA/Coding, SQL sandbox, and Interviews) for targeted spaced repetition,
 * concept revision, and weakness resolution.
 */
const mistakeBankSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceModule: {
      type: String,
      enum: ["quiz", "aptitude", "dsa", "sql", "interview", "system_design", "manual"],
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    questionTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    questionSlug: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "entry", "mid", "senior", ""],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    userAnswer: {
      type: String,
      default: "",
    },
    expectedAnswer: {
      type: String,
      default: "",
    },
    explanation: {
      type: String,
      default: "",
    },
    revisionStatus: {
      type: String,
      enum: ["unresolved", "reviewing", "mastered"],
      default: "unresolved",
      index: true,
    },
    attemptCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Targeted compound indexes for high-throughput filtering and revision queues
mistakeBankSchema.index({ userId: 1, revisionStatus: 1, sourceModule: 1 });
mistakeBankSchema.index({ userId: 1, questionTitle: 1 });
mistakeBankSchema.index({ userId: 1, createdAt: -1 });

const MistakeBank = mongoose.model("MistakeBank", mistakeBankSchema);
export default MistakeBank;
