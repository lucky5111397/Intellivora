import express from "express";
import {
  getQuestions,
  getQuestionBySlug,
  getQuestionCategories,
} from "../controllers/questionBank.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  getQuestionsQuerySchema,
  questionSlugParamSchema,
} from "../validators/questionBank.validator.js";

const questionBankRouter = express.Router();
questionBankRouter.use(generalLimiter);

questionBankRouter.get("/categories", getQuestionCategories);
questionBankRouter.get("/", validate(getQuestionsQuerySchema), getQuestions);
questionBankRouter.get("/:slug", validate(questionSlugParamSchema), getQuestionBySlug);

export default questionBankRouter;
