import mongoose from "mongoose";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const user = await User.findById(userId).select("-__v");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("[User Controller] getCurrentUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
};
