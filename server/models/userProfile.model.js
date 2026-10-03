import mongoose from "mongoose";

/**
 * UserProfile Entity Schema (1-to-1 extension of User)
 * Holds rich candidate career intelligence, target preferences, skills taxonomy,
 * and portfolio links without overloading the core authentication User document.
 */
const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      maxlength: 120,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
      default: "",
    },
    targetRole: {
      type: String,
      maxlength: 80,
      trim: true,
      default: "",
    },
    targetCompanies: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "0-1", "1-3", "3-5", "5+", ""],
      default: "",
    },
    skills: [
      {
        name: { type: String, required: true, trim: true },
        category: { type: String, default: "Technical", trim: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Intermediate",
        },
      },
    ],
    education: [
      {
        institution: { type: String, trim: true, default: "" },
        degree: { type: String, trim: true, default: "" },
        fieldOfStudy: { type: String, trim: true, default: "" },
        graduationYear: { type: Number, default: null },
      },
    ],
    links: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      difficultyPreference: {
        type: String,
        enum: ["adaptive", "entry", "mid", "senior"],
        default: "adaptive",
      },
    },
  },
  { timestamps: true }
);

// Targeted indexes for career queries & skill search
userProfileSchema.index({ targetRole: 1 });
userProfileSchema.index({ "skills.name": 1 });

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
