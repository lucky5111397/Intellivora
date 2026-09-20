import genToken from "./token.js";
import User from "../models/user.model.js";
import { verifyFirebaseIdToken } from "../services/firebaseAuth.service.js";

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

    if (!verifiedEmail || typeof verifiedEmail !== "string" || !verifiedEmail.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const safeEmail = String(verifiedEmail).trim().toLowerCase();

    let user = await User.findOne({ email: safeEmail });

    if (!user) {
      user = await User.create({
        name: typeof verifiedName === "string" && verifiedName.trim() ? verifiedName.trim() : "User",
        email: safeEmail,
        credits: 100,
      });
    } else {
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

    if (!verifiedPhone || typeof verifiedPhone !== "string" || !verifiedPhone.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    const safePhone = String(verifiedPhone).trim();
    const safeEmail = typeof verifiedEmail === "string" && verifiedEmail.trim() ? String(verifiedEmail).trim().toLowerCase() : `${safePhone}@phone.local`;

    let user = await User.findOne({ phone: safePhone });

    if (!user) {
      user = await User.create({
        name: typeof verifiedName === "string" && verifiedName.trim() ? verifiedName.trim() : "User",
        email: safeEmail,
        phone: safePhone,
        credits: 100,
      });
    } else {
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
