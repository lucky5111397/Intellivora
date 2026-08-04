import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  analyzeResume,
  finishInterview,
  generateQuestion,
  getMyInterviews,
  getInterviewReport,
  submitAnswer,
  deleteInterview,
} from "../controllers/interview.controller.js";
const interviewRouter = express.Router();

interviewRouter.post(
  "/resume",
  isAuth,
  upload.single("resume"),
  analyzeResume
);

interviewRouter.post(
  "/generate-questions",
  isAuth,
  generateQuestion
);

interviewRouter.post(
  "/submit-answer",
  isAuth,
  submitAnswer
);

interviewRouter.post(
  "/finish",
  isAuth,
  finishInterview
);

interviewRouter.get("/get-interviews", isAuth, getMyInterviews)
interviewRouter.get("/report/:id", isAuth, getInterviewReport);
interviewRouter.delete(
  "/delete-interview/:id",
  isAuth,
  deleteInterview
);



export default interviewRouter;