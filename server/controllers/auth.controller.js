import genToken from "./token.js";
import User from "../models/user.model.js";

export const googleAuth = async (req, res) => {
  try {
    console.log("API HIT");
    console.log("Body:", req.body);

    const { name, email } = req.body;

    console.log("Finding user...");
    let user = await User.findOne({ email });

    console.log("User:", user);

    if (!user) {
      console.log("Creating user...");
      user = await User.create({
        name,
        email,
        credits: 100,
      });
      console.log("User Created");
    }

    console.log("JWT_SECRET =", process.env.JWT_SECRET);

    const token = genToken(user._id);

    console.log("Generated Token:", token);
    console.log("Token Type:", typeof token);
    console.log("Token =", token);

    const isProduction = process.env.NODE_ENV === "production";
    const isLocalhost = req.hostname === "localhost" || req.hostname === "127.0.0.1";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction || isLocalhost,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("FULL ERROR");
    console.error(error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
};