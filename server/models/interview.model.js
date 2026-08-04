import mongoose from "mongoose";

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

// MongoDB Interview Schema
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

    resumeText: {
      type: String,
    },

    source: {
      type: String,
      enum: ["standard", "resume"],
      default: "standard",
    },

    // ⭐ NEW FIELDS
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

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;