import genToken from "./token.js";
import User from "../models/user.model.js";
import { verifyFirebaseIdToken } from "../services/firebaseAuth.service.js";

/**
 * Checks whether an email address is allowed by the server-side allowlist.
 * If SERVER_ALLOWED_EMAILS (or ALLOWED_EMAILS) is empty or unset, all authenticated emails are permitted.
 */
export const isEmailAllowed = (email) => {
  if (!email) return false;
  const rawAllowlist = process.env.SERVER_ALLOWED_EMAILS || process.env.ALLOWED_EMAILS || "";
  const allowed = rawAllowlist
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) {
    return true; // No restriction configured
  }

  return allowed.includes(email.trim().toLowerCase());
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken, name, email } = req.body;

    let verifiedEmail = email;
    let verifiedName = name;

    if (idToken) {
      const verified = await verifyFirebaseIdToken(idToken);
      if (verified.email) {
        verifiedEmail = verified.email;
      }
      if (verified.name) {
        verifiedName = verified.name;
      }
    } else if (process.env.NODE_ENV !== "test") {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    if (!verifiedEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Server-side email allowlist check
    if (!isEmailAllowed(verifiedEmail)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. You are not authorized to use this application.",
      });
    }

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      user = await User.create({
        name: verifiedName || "User",
        email: verifiedEmail,
        credits: 100,
      });
    }

    const token = genToken(user._id);

    const isDevelopment = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    const secure = !isDevelopment;

    res.cookie("token", token, {
      httpOnly: true,
      secure: secure,
      sameSite: isDevelopment ? "lax" : "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("[Auth] Google auth error:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Authentication failed. Please try again.",
    });
  }
};

export const phoneAuth = async (req, res) => {
  try {
    const { idToken, name, email, phone } = req.body;

    let verifiedPhone = phone;
    let verifiedName = name;
    let verifiedEmail = email;

    if (idToken) {
      const verified = await verifyFirebaseIdToken(idToken);
      if (verified.phone) {
        verifiedPhone = verified.phone;
      }
      if (verified.name) {
        verifiedName = verified.name;
      }
      if (verified.email) {
        verifiedEmail = verified.email;
      }
    } else if (process.env.NODE_ENV !== "test") {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    if (!verifiedPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    // If an email is associated, verify allowlist as well
    if (verifiedEmail && !isEmailAllowed(verifiedEmail)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. You are not authorized to use this application.",
      });
    }

    let user = await User.findOne({ phone: verifiedPhone });

    if (!user) {
      user = await User.create({
        name: verifiedName || "User",
        email: verifiedEmail || `${verifiedPhone}@phone.local`,
        phone: verifiedPhone,
        credits: 100,
      });
    }

    const token = genToken(user._id);

    const isDevelopment = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    const secure = !isDevelopment;

    res.cookie("token", token, {
      httpOnly: true,
      secure: secure,
      sameSite: isDevelopment ? "lax" : "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("[Auth] Phone auth error:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Phone authentication failed. Please try again.",
    });
  }
};

export const logout = async (req, res) => {
  const isDevelopment = req.hostname === "localhost" || req.hostname === "127.0.0.1";
  res.clearCookie("token", {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: isDevelopment ? "lax" : "none",
    path: "/",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};
