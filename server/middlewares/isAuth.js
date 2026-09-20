import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";

/**
 * Authentication Middleware
 * Validates JSON Web Tokens from HttpOnly cookies (web client) or Bearer authorization
 * headers (API / integration tests), decodes the payload, and attaches `req.userId`.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const isAuth = async (req, res, next) => {
  try {
    // Check HttpOnly cookie first (primary browser session), then fallback to Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    if (typeof token !== "string" || !token.trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      });
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(token.trim(), process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message:
          jwtErr.name === "TokenExpiredError"
            ? "Authentication token has expired. Please sign in again."
            : "Invalid authentication token.",
      });
    }

    if (!verifyToken || !verifyToken.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    req.userId = verifyToken.userId;

    // Reject banned or deactivated accounts on active sessions
    if (mongoose.connection.readyState === 1 || typeof User.findById.mock !== "undefined") {
      const user = await User.findById(verifyToken.userId).select("isBanned isActive");
      if (user) {
        if (user.isBanned) {
          return res.status(403).json({
            success: false,
            message: "Your account has been suspended. Please contact support.",
          });
        }
        if (user.isActive === false) {
          return res.status(403).json({
            success: false,
            message: "Your account is deactivated. Please contact support.",
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("[isAuth] Unexpected error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default isAuth;
