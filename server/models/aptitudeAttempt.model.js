import mongoose from "mongoose";

const attemptQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "AptitudeQuestion", required: true },
    questionSnapshot: { type: String, required: true },
    optionsSnapshot: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true },
        _id: false,
      },
    ],
    correctOptionKey: { type: String, enum: ["A", "B", "C", "D"] },
    selectedOptionKey: { type: String, enum: ["A", "B", "C", "D", null], default: null },
    markedForReview: { type: Boolean, default: false },
    result: { type: String, enum: ["correct", "incorrect", "skipped"], default: "skipped" },
    marksAwarded: { type: Number, default: 0 },
    explanationSnapshot: { type: String, default: "" },
  },
  { _id: false }
);

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    difficulty: { type: String, required: true },
    questionCount: { type: Number, required: true },
    timeLimitSeconds: { type: Number, default: 0 },
    questions: { type: [attemptQuestionSchema], required: true },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    status: { type: String, enum: ["in_progress", "submitted", "expired", "abandoned"], default: "in_progress", index: true },
  },
  { timestamps: true }
);

aptitudeAttemptSchema.index({ userId: 1, createdAt: -1 });
aptitudeAttemptSchema.index({ userId: 1, status: 1, createdAt: -1 });

const AptitudeAttempt = mongoose.model("AptitudeAttempt", aptitudeAttemptSchema);

export default AptitudeAttempt;
