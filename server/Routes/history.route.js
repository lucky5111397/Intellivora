import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getUnifiedHistory,
  deleteHistoryItem,
  getProgressAnalytics,
} from "../controllers/history.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const historyRouter = express.Router();

historyRouter.use(generalLimiter);
historyRouter.use(isAuth);
historyRouter.get("/", getUnifiedHistory);
historyRouter.get("/unified", getUnifiedHistory);
historyRouter.get("/progress", getProgressAnalytics);
historyRouter.delete("/:type/:id", deleteHistoryItem);

export default historyRouter;

