import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./Routes/auth.route.js";
import userRouter from "./Routes/user.route.js";
import interviewRouter from "./Routes/interview.route.js";
import paymentRouter from "./Routes/payment.route.js";
import resumeRouter from "./Routes/resume.route.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/resume", resumeRouter);

app.use(errorHandler);

console.log("===== LOCAL SERVER STARTED =====");

connectDb();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});