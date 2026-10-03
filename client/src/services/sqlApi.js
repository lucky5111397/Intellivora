import { apiClient } from "./apiClient.js";

export const getSqlProblems = async (params = {}) => {
  const response = await apiClient.get("/sql/problems", { params });
  return response.data;
};

export const getSqlProblemBySlug = async (slug) => {
  const response = await apiClient.get(`/sql/${slug}`);
  return response.data;
};

export const executeSqlQuery = async (slug, query) => {
  const response = await apiClient.post(`/sql/${slug}/execute`, { query });
  return response.data;
};

export default {
  getSqlProblems,
  getSqlProblemBySlug,
  executeSqlQuery,
};
