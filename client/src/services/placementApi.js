import { apiClient } from "./apiClient.js";

export const startPlacementDrive = async ({ targetCompany, targetRole }) => {
  const response = await apiClient.post("/placement/start", {
    targetCompany,
    targetRole,
  });
  return response.data;
};

export const getPlacementState = async (id) => {
  const response = await apiClient.get(`/placement/${id}`);
  return response.data;
};

export const submitRound = async (id, roundNum, { score, details }) => {
  const response = await apiClient.post(`/placement/${id}/round/${roundNum}`, {
    score,
    details,
  });
  return response.data;
};

export const getPlacementReport = async (id) => {
  const response = await apiClient.get(`/placement/${id}/report`);
  return response.data;
};

export const getPlacementHistory = async () => {
  const response = await apiClient.get("/placement/history");
  return response.data;
};

export default {
  startPlacementDrive,
  getPlacementState,
  submitRound,
  getPlacementReport,
  getPlacementHistory,
};
