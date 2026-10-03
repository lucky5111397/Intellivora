import mongoose from "mongoose";

const roadmapMilestoneSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    topics: { type: [String], default: [] },
    suggestedProblems: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const careerRoadmapSchema = new mongoose.Schema(
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
    },
    currentSkillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    targetTimelineWeeks: {
      type: Number,
      default: 8,
    },
    weeklyCommitmentHours: {
      type: Number,
      default: 10,
    },
    milestones: {
      type: [roadmapMilestoneSchema],
      default: [],
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

careerRoadmapSchema.index({ userId: 1, active: 1 });

const CareerRoadmap = mongoose.model("CareerRoadmap", careerRoadmapSchema);

export default CareerRoadmap;
