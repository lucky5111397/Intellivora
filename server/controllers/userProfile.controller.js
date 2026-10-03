import UserProfileService from "../services/userProfile.service.js";

/**
 * GET /api/user/profile
 * Retrieves full profile for the authenticated candidate.
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await UserProfileService.getOrCreateProfile(req.userId);
    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/user/profile
 * Updates profile fields for the authenticated candidate.
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const updated = await UserProfileService.updateProfile(req.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/profile/:userId
 * Retrieves public candidate profile by userId, sanitizing private preferences.
 */
export const getProfileById = async (req, res, next) => {
  try {
    const profile = await UserProfileService.getPublicProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};
