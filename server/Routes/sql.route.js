import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getSqlProblems,
  getSqlProblemBySlug,
  executeSql,
} from "../controllers/sql.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  executeSqlSchema,
  sqlSlugParamSchema,
} from "../validators/sql.validator.js";

const sqlRouter = express.Router();
sqlRouter.use(generalLimiter);

sqlRouter.get("/problems", getSqlProblems);
sqlRouter.get("/:slug", validate(sqlSlugParamSchema, "params"), getSqlProblemBySlug);
sqlRouter.post("/:slug/execute", isAuth, validate(executeSqlSchema), executeSql);

export default sqlRouter;
