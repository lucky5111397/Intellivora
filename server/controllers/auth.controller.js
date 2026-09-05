import genToken from "./token.js";
import User from "../models/user.model.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "User",
        email,
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
    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};

export const phoneAuth = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name: name || "User",
        email: email || `${phone}@phone.local`,
        phone,
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
    return res.status(500).json({
      success: false,
      message: "Phone authentication failed. Please try again.",
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
