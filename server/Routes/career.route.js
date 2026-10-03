import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  analyzeJobDescription,
  generateRoadmap,
  getRoadmap,
  updateMilestoneProgress,
  listJobs,
  createJob,
  updateJob,
  deleteJob,
  getCompanyPreparation,
  listTargetCompanies,
} from "../controllers/careerIntelligence.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  analyzeJdSchema,
  generateRoadmapSchema,
  updateMilestoneSchema,
  createJobApplicationSchema,
  updateJobApplicationSchema,
} from "../validators/career.validator.js";

const careerRouter = express.Router();
careerRouter.use(generalLimiter);

// 1. JD Analyzer
careerRouter.post("/analyze-jd", isAuth, validate(analyzeJdSchema), analyzeJobDescription);

// 2. Career Roadmap
careerRouter.get("/roadmap", isAuth, getRoadmap);
careerRouter.post("/roadmap", isAuth, validate(generateRoadmapSchema), generateRoadmap);
careerRouter.patch("/roadmap/milestone", isAuth, validate(updateMilestoneSchema), updateMilestoneProgress);

// 3. Job Tracker (Kanban / Applications)
careerRouter.get("/jobs", isAuth, listJobs);
careerRouter.post("/jobs", isAuth, validate(createJobApplicationSchema), createJob);
careerRouter.patch("/jobs/:id", isAuth, validate(updateJobApplicationSchema), updateJob);
careerRouter.delete("/jobs/:id", isAuth, deleteJob);

// 4. Company Preparation
careerRouter.get("/companies", listTargetCompanies);
careerRouter.get("/companies/:company", getCompanyPreparation);

export default careerRouter;
