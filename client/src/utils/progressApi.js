import axios from "axios";
import { ServerUrl } from "../App";

/**
 * Fetches candidate learning trajectory and progress analytics across all modules.
 * Returns { interviewTrend, aptitudeTrend, gdTrend, summaryStats }
 */
export const fetchProgressData = async () => {
  const response = await axios.get(`${ServerUrl}/api/history/progress`, {
    withCredentials: true,
  });
  return response.data;
};

