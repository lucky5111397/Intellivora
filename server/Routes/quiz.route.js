import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getQuizCategories,
  startQuiz,
  submitQuiz,
  getQuizResult,
  getQuizHistory,
} from "../controllers/quiz.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  startQuizSchema,
  submitQuizSchema,
} from "../validators/quiz.validator.js";

const quizRouter = express.Router();
quizRouter.use(generalLimiter);

quizRouter.get("/categories", getQuizCategories);
quizRouter.post("/start", isAuth, validate(startQuizSchema), startQuiz);
quizRouter.post("/:id/submit", isAuth, validate(submitQuizSchema), submitQuiz);
quizRouter.get("/history", isAuth, getQuizHistory);
quizRouter.get("/:id", isAuth, getQuizResult);

export default quizRouter;
