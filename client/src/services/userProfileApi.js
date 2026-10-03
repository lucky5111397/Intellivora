import { apiClient } from "./apiClient.js";

/**
 * Fetches the authenticated candidate's profile.
 */
export const fetchMyProfile = async () => {
  const response = await apiClient.get("/user/profile");
  return response.data;
};

/**
 * Updates the authenticated candidate's profile fields.
 *
 * @param {Object} payload
 */
export const updateMyProfile = async (payload) => {
  const response = await apiClient.put("/user/profile", payload);
  return response.data;
};

/**
 * Fetches a candidate's public profile by user ID.
 *
 * @param {string} userId
 */
export const fetchUserProfile = async (userId) => {
  const response = await apiClient.get(`/user/profile/${userId}`);
  return response.data;
};

export default {
  fetchMyProfile,
  updateMyProfile,
  fetchUserProfile,
};
