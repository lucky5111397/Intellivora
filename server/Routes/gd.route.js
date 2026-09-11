import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createSession,
  getSession,
  getOverview,
  setLobbyReady,
  submitTurn,
  completeSession,
  abortSession,
} from "../controllers/gd.controller.js";

const gdRouter = express.Router();

// Enforce authentication across all Group Discussion endpoints
gdRouter.use(isAuth);

// Hub overview
gdRouter.get("/overview", getOverview);

// Session lifecycle routes
gdRouter.post("/session/create", createSession);
gdRouter.get("/session/:id", getSession);
gdRouter.post("/session/:id/lobby-ready", setLobbyReady);
gdRouter.post("/session/:id/turn", submitTurn);
gdRouter.post("/session/:id/complete", completeSession);
gdRouter.post("/session/:id/abort", abortSession);

export default gdRouter;
