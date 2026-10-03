import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  startPlacementDrive,
  getPlacementState,
  submitRound,
  getPlacementReport,
  listPlacementSessions,
} from "../controllers/mockPlacement.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  startPlacementSchema,
  submitRoundSchema,
  placementSessionParamSchema,
} from "../validators/placement.validator.js";

const placementRouter = express.Router();
placementRouter.use(generalLimiter);

placementRouter.get("/history", isAuth, listPlacementSessions);
placementRouter.post("/start", isAuth, validate(startPlacementSchema), startPlacementDrive);
placementRouter.get("/:id", isAuth, validate(placementSessionParamSchema, "params"), getPlacementState);
placementRouter.post("/:id/round/:roundNum", isAuth, validate(submitRoundSchema), submitRound);
placementRouter.get("/:id/report", isAuth, validate(placementSessionParamSchema, "params"), getPlacementReport);

export default placementRouter;
