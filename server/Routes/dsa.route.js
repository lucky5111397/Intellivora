import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getDsaProblemBySlug,
  runSampleCode,
  submitCode,
  getSubmissionHistory,
  getUserCodingProgress,
  getDsaAiHint,
} from "../controllers/dsa.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  runSampleCodeSchema,
  submitCodeSchema,
  hintRequestSchema,
  historyParamsSchema,
} from "../validators/dsa.validator.js";

const dsaRouter = express.Router();
dsaRouter.use(generalLimiter);

// DSA practice workspace endpoints
dsaRouter.get("/problems/:slug", isAuth, getDsaProblemBySlug);
dsaRouter.post(
  "/problems/:slug/run",
  isAuth,
  validate(runSampleCodeSchema),
  runSampleCode
);
dsaRouter.post(
  "/problems/:slug/submit",
  isAuth,
  validate(submitCodeSchema),
  submitCode
);
dsaRouter.post(
  "/problems/:slug/hint",
  isAuth,
  validate(hintRequestSchema),
  getDsaAiHint
);
dsaRouter.get(
  "/history/:slug",
  isAuth,
  validate(historyParamsSchema),
  getSubmissionHistory
);
dsaRouter.get("/progress", isAuth, getUserCodingProgress);

export default dsaRouter;
