import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const userRouter = express.Router();
userRouter.use(generalLimiter);

userRouter.get("/current-user", isAuth, getCurrentUser)

export default userRouter