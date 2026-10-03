import { apiClient } from "./apiClient.js";

/**
 * Fetches the authenticated user's credit transaction ledger.
 *
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const fetchMyCreditTransactions = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get("/user/credits/transactions", {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Fetches administrative credit audit history for a specific user ID.
 *
 * @param {string} userId
 * @param {Object} [params]
 */
export const fetchUserCreditHistory = async (userId, { page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get(`/admin/users/${userId}/credit-history`, {
    params: { page, limit },
  });
  return response.data;
};

export default {
  fetchMyCreditTransactions,
  fetchUserCreditHistory,
};
