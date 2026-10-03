import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getSystemDesignProblems,
  getSystemDesignProblemBySlug,
  getAttempt,
  saveDraft,
  evaluateSubmission,
} from "../controllers/systemDesign.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  saveDraftSchema,
  evaluateSystemDesignSchema,
  systemDesignSlugParamSchema,
} from "../validators/systemDesign.validator.js";

const systemDesignRouter = express.Router();
systemDesignRouter.use(generalLimiter);

systemDesignRouter.get("/problems", getSystemDesignProblems);
systemDesignRouter.get("/:slug", validate(systemDesignSlugParamSchema, "params"), getSystemDesignProblemBySlug);
systemDesignRouter.get("/:slug/attempt", isAuth, validate(systemDesignSlugParamSchema, "params"), getAttempt);
systemDesignRouter.put("/:slug/draft", isAuth, validate(saveDraftSchema), saveDraft);
systemDesignRouter.post("/:slug/evaluate", isAuth, validate(evaluateSystemDesignSchema), evaluateSubmission);

export default systemDesignRouter;
