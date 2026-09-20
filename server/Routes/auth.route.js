import express from "express";
import { googleAuth, phoneAuth, logout } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const authRouter = express.Router();
authRouter.use(authLimiter);

authRouter.post("/google", googleAuth);
authRouter.post("/phone", phoneAuth);
authRouter.get("/logout", logout);
authRouter.post("/logout", logout);

export default authRouter;