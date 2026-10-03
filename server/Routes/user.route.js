import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import {
  getMyProfile,
  updateMyProfile,
  getProfileById,
} from "../controllers/userProfile.controller.js";
import { getMyCreditTransactions } from "../controllers/creditLedger.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  updateProfileSchema,
  userIdParamSchema,
} from "../validators/userProfile.validator.js";
import { paginationQuerySchema } from "../validators/credit.validator.js";

const userRouter = express.Router();
userRouter.use(generalLimiter);

// Auth session hydration
userRouter.get("/current-user", isAuth, getCurrentUser);

// Candidate Profile Foundation
userRouter.get("/profile", isAuth, getMyProfile);
userRouter.put("/profile", isAuth, validate(updateProfileSchema), updateMyProfile);
userRouter.get("/profile/:userId", isAuth, validate(userIdParamSchema), getProfileById);

// Credit Transaction Ledger History
userRouter.get(
  "/credits/transactions",
  isAuth,
  validate(paginationQuerySchema),
  getMyCreditTransactions
);

export default userRouter;