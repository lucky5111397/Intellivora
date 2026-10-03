import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: "Remote",
    },
    salaryRange: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"],
      default: "Wishlist",
      index: true,
    },
    jobUrl: {
      type: String,
      default: "",
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    matchScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ userId: 1, status: 1 });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
