import { apiClient } from "./apiClient.js";

export const getQuestions = async (params = {}) => {
  const response = await apiClient.get("/questions", { params });
  return response.data;
};

export const getQuestionBySlug = async (slug) => {
  const response = await apiClient.get(`/questions/${slug}`);
  return response.data;
};

export const getQuestionCategories = async (contentType) => {
  const response = await apiClient.get("/questions/categories", {
    params: contentType ? { contentType } : {},
  });
  return response.data;
};

export default {
  getQuestions,
  getQuestionBySlug,
  getQuestionCategories,
};
