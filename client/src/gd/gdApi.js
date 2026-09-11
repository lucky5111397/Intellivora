import axios from "axios";

export const ServerUrl = import.meta.env?.VITE_SERVER_URL || "http://localhost:8000";

const gdApi = axios.create({
  baseURL: `${ServerUrl}/api/gd`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extracts a normalized, user-friendly error message from an API error.
 */
export const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "An unexpected error occurred. Please check your connection."
  );
};

// Hub / Overview
export const getGDOverview = () => gdApi.get("/overview");

// Session Lifecycle
export const createGDSession = (data) => gdApi.post("/session/create", data);
export const getGDSession = (sessionId) => gdApi.get(`/session/${sessionId}`);
export const setGDLobbyReady = (sessionId) => gdApi.post(`/session/${sessionId}/lobby-ready`);
export const submitGDTurn = (sessionId, turnData) => gdApi.post(`/session/${sessionId}/turn`, turnData);
export const completeGDSession = (sessionId, completionData = {}) =>
  gdApi.post(`/session/${sessionId}/complete`, completionData);
export const abortGDSession = (sessionId) => gdApi.post(`/session/${sessionId}/abort`);

export default gdApi;
