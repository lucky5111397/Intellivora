import express from "express";
import uploadResume, { verifyPdfMagicBytes } from "../middlewares/uploadResume.js";
import isAuth from "../middlewares/isAuth.js";
import {
  uploadResume as uploadResumeController,
  extractResumeText,
  analyzeResume,
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.post(
  "/upload",
  isAuth,
  uploadResume.single("resume"),
  verifyPdfMagicBytes,
  uploadResumeController
);
resumeRouter.post("/extract", isAuth, extractResumeText);
resumeRouter.post("/analyze", isAuth, analyzeResume);

export default resumeRouter;

