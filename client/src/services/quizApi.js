import { apiClient } from "./apiClient.js";

export const getQuizCategories = async () => {
  const response = await apiClient.get("/quizzes/categories");
  return response.data;
};

export const startQuiz = async ({ category, difficulty, durationMinutes }) => {
  const response = await apiClient.post("/quizzes/start", {
    category,
    difficulty,
    durationMinutes,
  });
  return response.data;
};

export const submitQuiz = async (id, { answers, timeTakenSeconds }) => {
  const response = await apiClient.post(`/quizzes/${id}/submit`, {
    answers,
    timeTakenSeconds,
  });
  return response.data;
};

export const getQuizResult = async (id) => {
  const response = await apiClient.get(`/quizzes/${id}`);
  return response.data;
};

export const getQuizHistory = async () => {
  const response = await apiClient.get("/quizzes/history");
  return response.data;
};

export default {
  getQuizCategories,
  startQuiz,
  submitQuiz,
  getQuizResult,
  getQuizHistory,
};
