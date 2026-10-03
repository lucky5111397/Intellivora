import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  createMistakeSchema,
  updateMistakeStatusSchema,
  updateMistakeNotesSchema,
  queryMistakesSchema,
  mistakeIdParamSchema,
} from "../validators/mistakeBank.validator.js";
import {
  getMistakes,
  recordMistake,
  updateMistakeStatus,
  updateMistakeNotes,
  deleteMistake,
  getMistakeStats,
} from "../controllers/mistakeBank.controller.js";

const mistakeRouter = express.Router();
mistakeRouter.use(generalLimiter);

mistakeRouter.get(
  "/",
  isAuth,
  validate({ query: queryMistakesSchema }),
  getMistakes
);

mistakeRouter.post(
  "/",
  isAuth,
  validate({ body: createMistakeSchema }),
  recordMistake
);

mistakeRouter.get(
  "/stats",
  isAuth,
  getMistakeStats
);

mistakeRouter.patch(
  "/:id/status",
  isAuth,
  validate({ params: mistakeIdParamSchema }),
  validate({ body: updateMistakeStatusSchema }),
  updateMistakeStatus
);

mistakeRouter.patch(
  "/:id/notes",
  isAuth,
  validate({ params: mistakeIdParamSchema }),
  validate({ body: updateMistakeNotesSchema }),
  updateMistakeNotes
);

mistakeRouter.delete(
  "/:id",
  isAuth,
  validate({ params: mistakeIdParamSchema }),
  deleteMistake
);

export default mistakeRouter;
