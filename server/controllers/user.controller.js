import mongoose from "mongoose";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import { getPlanDisplayName } from "./payment.controller.js";

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

    // Retrieve the user's latest completed payment to compute active plan
    const latestPayment = await Payment.findOne({
      userId: user._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .select("planId")
      .lean();

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.currentPlan = latestPayment ? getPlanDisplayName(latestPayment.planId) : null;

    return res.status(200).json(userObj);
  } catch (error) {
    console.error("[User Controller] getCurrentUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
};
