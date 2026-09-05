import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    practiceTimeSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const aptitudeProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    totals: { type: metricSchema, default: () => ({}) },
    categories: { type: Map, of: metricSchema, default: () => ({}) },
    topics: { type: Map, of: metricSchema, default: () => ({}) },
    readiness: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AptitudeProgress = mongoose.model("AptitudeProgress", aptitudeProgressSchema);

export default AptitudeProgress;
