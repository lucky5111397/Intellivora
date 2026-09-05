import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getUnifiedHistory, deleteHistoryItem } from "../controllers/history.controller.js";

const historyRouter = express.Router();

historyRouter.use(isAuth);
historyRouter.get("/", getUnifiedHistory);
historyRouter.get("/unified", getUnifiedHistory);
historyRouter.delete("/:type/:id", deleteHistoryItem);

export default historyRouter;

