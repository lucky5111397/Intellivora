import { apiClient } from "./apiClient.js";

export const getSystemDesignProblems = async (params = {}) => {
  const response = await apiClient.get("/system-design/problems", { params });
  return response.data;
};

export const getSystemDesignProblemBySlug = async (slug) => {
  const response = await apiClient.get(`/system-design/${slug}`);
  return response.data;
};

export const getSystemDesignAttempt = async (slug) => {
  const response = await apiClient.get(`/system-design/${slug}/attempt`);
  return response.data;
};

export const saveSystemDesignDraft = async (slug, { diagramData, architecturalNotes }) => {
  const response = await apiClient.put(`/system-design/${slug}/draft`, {
    diagramData,
    architecturalNotes,
  });
  return response.data;
};

export const evaluateSystemDesign = async (slug, { diagramData, architecturalNotes }) => {
  const response = await apiClient.post(`/system-design/${slug}/evaluate`, {
    diagramData,
    architecturalNotes,
  });
  return response.data;
};

export default {
  getSystemDesignProblems,
  getSystemDesignProblemBySlug,
  getSystemDesignAttempt,
  saveSystemDesignDraft,
  evaluateSystemDesign,
};
