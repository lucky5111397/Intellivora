import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["A", "B", "C", "D"], required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, unique: true, index: true, default: () => `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` },
    category: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    question: { type: String, required: true },
    options: { type: [optionSchema], required: true },
    correctOptionKey: { type: String, enum: ["A", "B", "C", "D"], required: true },
    explanation: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    marks: { type: Number, default: 1, min: 0 },
    negativeMarks: { type: Number, default: 0.25, min: 0 },
    active: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [] },
    source: { type: String, default: "local-seed" },
    estimatedTimeSeconds: { type: Number, default: 60, min: 0 },
  },
  { timestamps: true }
);

aptitudeQuestionSchema.index({ category: 1, topic: 1, difficulty: 1, active: 1 });

const AptitudeQuestion = mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);

export default AptitudeQuestion;
