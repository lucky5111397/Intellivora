import { apiClient } from "../services/apiClient.js";

/**
 * Fetches candidate learning trajectory and progress analytics across all modules.
 * Returns { interviewTrend, aptitudeTrend, gdTrend, summaryStats }
 */
export const fetchProgressData = async () => {
  const response = await apiClient.get("/history/progress");
  return response.data;
};

export default { fetchProgressData };
