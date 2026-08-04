import express from "express";
import uploadResume from "../middlewares/uploadResume.js";
import isAuth from "../middlewares/isAuth.js";
import {
  uploadResume as uploadResumeController,
  extractResumeText,
  analyzeResume,
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.post("/upload", uploadResume.single("resume"), uploadResumeController);
resumeRouter.post("/extract", extractResumeText);
resumeRouter.post("/analyze", isAuth, analyzeResume);

export default resumeRouter;
