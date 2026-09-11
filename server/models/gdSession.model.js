import mongoose from "mongoose";

const turnSchema = new mongoose.Schema(
  {
    turnNumber: {
      type: Number,
      required: [true, "Turn number is required"],
      min: [1, "Turn number must be at least 1"],
    },
    speakerId: {
      type: String,
      required: [true, "Speaker ID is required"],
      enum: {
        values: ["candidate", "agent_1", "agent_2", "agent_3", "orchestrator"],
        message: "{VALUE} is not a valid speaker ID",
      },
    },
    speakerLabel: {
      type: String,
      required: [true, "Speaker label is required"],
      enum: {
        values: ["You", "Agent 1", "Agent 2", "Agent 3", "System"],
        message: "{VALUE} is not a valid speaker label",
      },
    },
    personaRole: {
      type: String,
      enum: {
        values: ["candidate", "analytical", "confident", "critical_thinker", "system"],
        message: "{VALUE} is not a valid persona role",
      },
      default: "candidate",
    },
    content: {
      type: String,
      required: [true, "Turn content is required"],
      trim: true,
      maxlength: [4000, "Turn content cannot exceed 4000 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: [0, "Duration seconds cannot be negative"],
    },
    interruptedPrevious: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const telemetrySchema = new mongoose.Schema(
  {
    candidateSpeakingTimeSeconds: { type: Number, default: 0, min: 0 },
    candidateTurnCount: { type: Number, default: 0, min: 0 },
    agent1SpeakingTimeSeconds: { type: Number, default: 0, min: 0 },
    agent2SpeakingTimeSeconds: { type: Number, default: 0, min: 0 },
    agent3SpeakingTimeSeconds: { type: Number, default: 0, min: 0 },
    totalSessionDurationSeconds: { type: Number, default: 0, min: 0 },
    totalTurnsCount: { type: Number, default: 0, min: 0 },
    interruptionsCount: { type: Number, default: 0, min: 0 },
    averageCandidateResponseLatencySeconds: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const turnFeedbackSchema = new mongoose.Schema(
  {
    turnNumber: {
      type: Number,
      required: true,
    },
    speakerLabel: {
      type: String,
      required: true,
    },
    critiqueType: {
      type: String,
      required: true,
      enum: {
        values: [
          "strong_point",
          "effective_rebuttal",
          "constructive_addition",
          "off_topic",
          "interruption",
          "filler",
        ],
        message: "{VALUE} is not a valid critique type",
      },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      min: [0, "Score cannot be less than 0"],
      max: [100, "Score cannot be greater than 100"],
    },
    breakdown: {
      articulation: { type: Number, min: 0, max: 100, default: 0 },
      leadership: { type: Number, min: 0, max: 100, default: 0 },
      listening: { type: Number, min: 0, max: 100, default: 0 },
      criticalThinking: { type: Number, min: 0, max: 100, default: 0 },
    },
    strengths: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Strength item cannot exceed 500 characters"],
      },
    ],
    improvements: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Improvement item cannot exceed 500 characters"],
      },
    ],
    detailedFeedback: {
      type: String,
      trim: true,
      maxlength: [5000, "Detailed feedback cannot exceed 5000 characters"],
    },
    turnFeedback: [turnFeedbackSchema],
  },
  { _id: false }
);

const gdSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      minlength: [5, "Topic must be at least 5 characters"],
      maxlength: [300, "Topic cannot exceed 300 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Technology & AI",
          "Business & Economics",
          "Social & Ethical",
          "Case Studies",
          "Custom",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    difficulty: {
      type: String,
      enum: {
        values: ["entry", "mid", "executive"],
        message: "{VALUE} is not a valid difficulty level",
      },
      default: "mid",
    },
    durationMinutes: {
      type: Number,
      default: 10,
      min: [3, "Duration must be at least 3 minutes"],
      max: [30, "Duration cannot exceed 30 minutes"],
    },
    maxTurns: {
      type: Number,
      default: 30,
      min: [5, "Max turns must be at least 5"],
      max: [50, "Max turns cannot exceed 50"],
    },
    status: {
      type: String,
      enum: {
        values: ["setup", "lobby", "in_progress", "completed", "aborted", "failed"],
        message: "{VALUE} is not a valid session status",
      },
      default: "setup",
      index: true,
    },
    creditsDeducted: {
      type: Number,
      required: [true, "Credits deducted is required"],
      min: [0, "Credits deducted cannot be negative"],
    },
    refunded: {
      type: Boolean,
      default: false,
    },
    activeSpeakerId: {
      type: String,
      enum: {
        values: ["candidate", "agent_1", "agent_2", "agent_3", "orchestrator", null],
        message: "{VALUE} is not a valid active speaker ID",
      },
      default: null,
    },
    transcript: [turnSchema],
    telemetry: {
      type: telemetrySchema,
      default: () => ({}),
    },
    evaluation: {
      type: evaluationSchema,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for security, history, and duplicate prevention
gdSessionSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
gdSessionSchema.index({ userId: 1, createdAt: -1 });
gdSessionSchema.index({ userId: 1, status: 1 });
gdSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

const GDSession = mongoose.model("GDSession", gdSessionSchema);

export default GDSession;

