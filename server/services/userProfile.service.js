import UserProfile from "../models/userProfile.model.js";

/**
 * Service managing Candidate UserProfile lifecycle and privacy boundaries.
 */
export class UserProfileService {
  /**
   * Retrieves user profile by userId. Atomically creates a default profile if none exists.
   *
   * @param {string} userId
   * @returns {Promise<import("mongoose").Document>}
   */
  static async getOrCreateProfile(userId) {
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        headline: "",
        bio: "",
        targetRole: "",
        targetCompanies: [],
        experienceLevel: "",
        skills: [],
        education: [],
        links: { github: "", linkedin: "", portfolio: "" },
        preferences: {
          emailNotifications: true,
          jobAlerts: true,
          difficultyPreference: "adaptive",
        },
      });
    }
    return profile;
  }

  /**
   * Updates profile fields for the authenticated user.
   *
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<import("mongoose").Document>}
   */
  static async updateProfile(userId, updateData) {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    return profile;
  }

  /**
   * Fetches public candidate profile, strictly stripping private notification/account preferences.
   *
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  static async getPublicProfile(userId) {
    const profile = await UserProfile.findOne({ userId })
      .populate("userId", "name email createdAt")
      .select("-preferences -__v")
      .lean();

    return profile;
  }
}

export default UserProfileService;
