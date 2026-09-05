import express from "express";
import { googleAuth, phoneAuth, logout } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/phone", phoneAuth);
authRouter.get("/logout", logout);
authRouter.post("/logout", logout);

export default authRouter;