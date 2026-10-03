import { apiClient } from "./apiClient.js";

export const getDsaProblems = async (params = {}) => {
  const response = await apiClient.get("/questions", {
    params: { ...params, contentType: "dsa" },
  });
  return response.data;
};

export const getDsaProblem = async (slug) => {
  const response = await apiClient.get(`/dsa/problems/${slug}`);
  return response.data;
};

export const runSampleCode = async (slug, { language, code, customInput }) => {
  const response = await apiClient.post(`/dsa/problems/${slug}/run`, {
    language,
    code,
    customInput,
  });
  return response.data;
};

export const submitCode = async (slug, { language, code }) => {
  const response = await apiClient.post(`/dsa/problems/${slug}/submit`, {
    language,
    code,
  });
  return response.data;
};

export const getHint = async (slug, level = 1, currentCode = "") => {
  const response = await apiClient.post(`/dsa/problems/${slug}/hint`, {
    level,
    currentCode,
  });
  return response.data;
};

export const getUserProgress = async () => {
  const response = await apiClient.get("/dsa/progress");
  return response.data;
};

export const getSubmissionHistory = async (slug) => {
  const response = await apiClient.get(`/dsa/history/${slug}`);
  return response.data;
};

export default {
  getDsaProblems,
  getDsaProblem,
  runSampleCode,
  submitCode,
  getHint,
  getUserProgress,
  getSubmissionHistory,
};
