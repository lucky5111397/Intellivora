import mongoose from "mongoose";

const userCodingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    solvedProblemSlugs: {
      type: [String],
      default: [],
    },
    attemptedProblemSlugs: {
      type: [String],
      default: [],
    },
    easyCount: {
      type: Number,
      default: 0,
    },
    mediumCount: {
      type: Number,
      default: 0,
    },
    hardCount: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastSolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const UserCodingProgress = mongoose.model("UserCodingProgress", userCodingProgressSchema);

export default UserCodingProgress;
