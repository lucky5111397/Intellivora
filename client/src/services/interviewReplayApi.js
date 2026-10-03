import { apiClient } from "./apiClient.js";

export const getReplayableInterviews = async () => {
  const response = await apiClient.get("/interview/replay/list");
  return response.data;
};

export const getInterviewReplay = async (id) => {
  const response = await apiClient.get(`/interview/replay/${id}`);
  return response.data;
};

export default {
  getReplayableInterviews,
  getInterviewReplay,
};
