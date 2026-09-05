import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCategories,
  getTopics,
  getProgressData,
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttempts,
  getActiveAttempt,
  getAttempt,
  getAttemptResult,
  deleteAttempt,
} from "../controllers/aptitude.controller.js";

const aptitudeRouter = express.Router();

aptitudeRouter.use(isAuth);
aptitudeRouter.get("/categories", getCategories);
aptitudeRouter.get("/categories/:category/topics", getTopics);
aptitudeRouter.get("/progress", getProgressData);
aptitudeRouter.post("/attempts", startAttempt);
aptitudeRouter.post("/attempts/:id/answers", saveAnswer);
aptitudeRouter.patch("/attempts/:id/answers", saveAnswer);
aptitudeRouter.post("/attempts/:id/save-answer", saveAnswer);
aptitudeRouter.patch("/attempts/:id/save-answer", saveAnswer);
aptitudeRouter.post("/attempts/:id/submit", submitAttempt);
aptitudeRouter.get("/attempts", getAttempts);
aptitudeRouter.get("/attempts/active", getActiveAttempt);
aptitudeRouter.get("/attempts/:id", getAttempt);
aptitudeRouter.get("/attempts/:id/result", getAttemptResult);
aptitudeRouter.delete("/attempts/:id", deleteAttempt);

export default aptitudeRouter;
