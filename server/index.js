import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
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
import gdRouter from "./Routes/gd.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import securityHeaders from "./middlewares/securityHeaders.js";
import {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  aiLimiter,
} from "./middlewares/rateLimiter.js";

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
app.use(cors(corsOptions));

// Security headers (OWASP protection against MIME sniffing, clickjacking, etc.)
app.use(securityHeaders);

// Global rate limiting
app.use(generalLimiter);

app.use(express.json());
app.use(cookieParser());

// Health check endpoint (verifies MongoDB database readiness)
app.get("/health", (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  const status = isDbReady ? 200 : 503;
  res.status(status).json({
    status: isDbReady ? "ok" : "degraded",
    database: isDbReady ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Log environment
console.log("[SERVER] Allowed CORS Origins:", allowedOrigins);
console.log("[SERVER] NODE_ENV:", process.env.NODE_ENV);
console.log("[SERVER] CLIENT_URL from env:", process.env.CLIENT_URL);

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", aiLimiter, interviewRouter);
app.use("/api/payment", paymentLimiter, paymentRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/aptitude", aptitudeRouter);
app.use("/api/history", historyRouter);
app.use("/api/gd", aiLimiter, gdRouter);

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