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
import aptitudeRouter from "./Routes/aptitude.route.js";
import historyRouter from "./Routes/history.route.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// Build allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

// Add production frontend URL if configured (trim whitespace)
if (process.env.CLIENT_URL && process.env.CLIENT_URL.trim()) {
  allowedOrigins.push(process.env.CLIENT_URL.trim());
}

// CORS configuration with explicit origin list
// Allows credentials (cookies/JWT) to be sent with requests
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// CRITICAL: Apply CORS middleware globally BEFORE any routes
// cors middleware automatically handles OPTIONS preflight requests
// No need for explicit app.options() in Express 5
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Health check endpoint (for monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Log environment
console.log("[SERVER] Allowed CORS Origins:", allowedOrigins);
console.log("[SERVER] NODE_ENV:", process.env.NODE_ENV);
console.log("[SERVER] CLIENT_URL from env:", process.env.CLIENT_URL);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/aptitude", aptitudeRouter);
app.use("/api/history", historyRouter);

app.use(errorHandler);

// Process safety traps to log unhandled errors safely without crashing unexpectedly
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Process Safety] Unhandled Rejection:", reason?.message || reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Process Safety] Uncaught Exception:", error.message);
});

console.log("===== LOCAL SERVER STARTED =====");

connectDb();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});