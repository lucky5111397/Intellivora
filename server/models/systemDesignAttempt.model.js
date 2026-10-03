import mongoose from "mongoose";

const architecturalNotesSchema = new mongoose.Schema(
  {
    functionalRequirements: { type: String, default: "" },
    nonFunctionalRequirements: { type: String, default: "" },
    estimations: { type: String, default: "" },
    highLevelArchitecture: { type: String, default: "" },
    dataStorage: { type: String, default: "" },
    apiDesign: { type: String, default: "" },
    tradeOffsAndBottlenecks: { type: String, default: "" },
  },
  { _id: false }
);

const rubricScoresSchema = new mongoose.Schema(
  {
    architecturalCompleteness: { type: Number, default: 0, min: 0, max: 25 },
    scalingCorrectness: { type: Number, default: 0, min: 0, max: 25 },
    dataDesign: { type: Number, default: 0, min: 0, max: 25 },
    tradeOffAnalysis: { type: Number, default: 0, min: 0, max: 25 },
    totalScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const systemDesignFeedbackSchema = new mongoose.Schema(
  {
    summary: { type: String, default: "" },
    strengths: { type: [String], default: [] },
    improvementAreas: { type: [String], default: [] },
    scalingRecommendations: { type: [String], default: [] },
  },
  { _id: false }
);

const systemDesignAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    diagramData: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
    architecturalNotes: {
      type: architecturalNotesSchema,
      default: () => ({}),
    },
    rubricScores: {
      type: rubricScoresSchema,
      default: () => ({}),
    },
    feedback: {
      type: systemDesignFeedbackSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "evaluated"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

systemDesignAttemptSchema.index({ userId: 1, slug: 1 });

const SystemDesignAttempt = mongoose.model(
  "SystemDesignAttempt",
  systemDesignAttemptSchema
);

export default SystemDesignAttempt;
