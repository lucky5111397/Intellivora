import { apiClient } from "./apiClient.js";

export const analyzeJobDescription = async ({ jobDescription, resumeText }) => {
  const response = await apiClient.post("/career/analyze-jd", {
    jobDescription,
    resumeText,
  });
  return response.data;
};

export const getRoadmap = async () => {
  const response = await apiClient.get("/career/roadmap");
  return response.data;
};

export const generateRoadmap = async (data) => {
  const response = await apiClient.post("/career/roadmap", data);
  return response.data;
};

export const updateMilestone = async (milestoneId, completed) => {
  const response = await apiClient.patch("/career/roadmap/milestone", {
    milestoneId,
    completed,
  });
  return response.data;
};

export const getJobs = async (status) => {
  const response = await apiClient.get("/career/jobs", {
    params: status ? { status } : {},
  });
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await apiClient.post("/career/jobs", jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await apiClient.patch(`/career/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await apiClient.delete(`/career/jobs/${id}`);
  return response.data;
};

export const getTargetCompanies = async () => {
  const response = await apiClient.get("/career/companies");
  return response.data;
};

export const getCompanyDetails = async (company) => {
  const response = await apiClient.get(`/career/companies/${company}`);
  return response.data;
};

export default {
  analyzeJobDescription,
  getRoadmap,
  generateRoadmap,
  updateMilestone,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getTargetCompanies,
  getCompanyDetails,
};
