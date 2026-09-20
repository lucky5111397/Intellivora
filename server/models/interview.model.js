import mongoose from "mongoose";

/**
 * Embedded Schema: Individual Interview Question & Evaluation
 * Records question prompt, difficulty tier, time allocation, candidate transcription,
 * and multi-dimensional AI scoring (confidence, communication, correctness).
 */
const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
});

/**
 * Root Interview Session Schema
 * Persists configuration, resume context, question trajectory, and final scores.
 */
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      enum: ["HR", "Technical"],
      required: true,
    },

    targetCompany: {
      type: String,
      trim: true,
      default: null,
    },

    resumeText: {
      type: String,
    },

    source: {
      type: String,
      enum: ["standard", "resume"],
      default: "standard",
    },

    interviewPlan: {
      type: String,
      enum: ["short", "medium", "long"],
      default: "medium",
    },

    questionCount: {
      type: Number,
      default: 15,
    },

    creditsUsed: {
      type: Number,
      default: 150,
    },

    questions: [questionsSchema],

    finalScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Incompleted", "Completed"],
      default: "Incompleted",
    },
  },
  { timestamps: true }
);

interviewSchema.index({ userId: 1, createdAt: -1 });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;