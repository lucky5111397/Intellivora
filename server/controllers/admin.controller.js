import mongoose from "mongoose";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import GDSession from "../models/gdSession.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import Payment from "../models/payment.model.js";
import NewsletterSubscriber from "../models/newsletterSubscriber.model.js";
import { getPlanDisplayName } from "./payment.controller.js";

/**
 * Admin Console Controller
 * Provides administrative oversight endpoints for managing user accounts,
 * credit adjustments, and platform-wide telemetry aggregation.
 */

/**
 * Retrieves a paginated directory of registered users with optional search filtering.
 * GET /api/admin/users
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escapedQuery = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedQuery, $options: "i" } },
        { email: { $regex: escapedQuery, $options: "i" } },
      ];
    }

    const [totalUsers, rawUsers] = await Promise.all([
      User.countDocuments(filter),
      User.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            credits: 1,
            isActive: 1,
            isBanned: 1,
            createdAt: 1,
          },
        },
        {
          $lookup: {
            from: "payments",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$status", "paid"] },
                    ],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              { $project: { planId: 1 } },
            ],
            as: "latestPayment",
          },
        },
      ]),
    ]);

    const users = rawUsers.map((u) => {
      const latestPlanId = u.latestPayment?.[0]?.planId;
      const { latestPayment, ...rest } = u;
      return {
        ...rest,
        currentPlan: latestPlanId ? getPlanDisplayName(latestPlanId) : null,
      };
    });

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllUsers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user directory.",
    });
  }
};

/**
 * Updates a user account's profile or status flags (isActive, isBanned, name).
 * PATCH /api/admin/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive, isBanned } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }
    if (typeof isBanned === "boolean") {
      user.isBanned = isBanned;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        isActive: user.isActive,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] updateUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

/**
 * Deletes a user account.
 * Note: Historical assessment and payment records are preserved for audit and integrity.
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully. Historical session and payment records preserved.",
    });
  } catch (error) {
    console.error("[Admin Controller] deleteUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

/**
 * PATCH /api/admin/users/:id/credits
 * Allows admin to add, deduct, or explicitly set credits for a user.
 */
export const updateUserCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, newCredits } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let updatedCredits;

    if (typeof newCredits === "number" && !isNaN(newCredits)) {
      updatedCredits = Math.max(0, Math.round(newCredits));
    } else if (typeof amount === "number" && !isNaN(amount)) {
      updatedCredits = Math.max(0, user.credits + Math.round(amount));
    } else {
      return res.status(400).json({
        success: false,
        message: "Either 'amount' (relative change) or 'newCredits' (absolute value) must be provided as a number.",
      });
    }

    user.credits = updatedCredits;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User credits updated to ${updatedCredits}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] updateUserCredits error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update user credits.",
    });
  }
};

/**
 * GET /api/admin/analytics
 * Aggregates platform-wide metrics across all collections.
 */
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalInterviews,
      totalAptitudeAttempts,
      totalGDSessions,
      totalResumeAnalyses,
      paymentAggregate,
    ] = await Promise.all([
      User.countDocuments(),
      Interview.countDocuments(),
      AptitudeAttempt.countDocuments(),
      GDSession.countDocuments(),
      ResumeAnalysis.countDocuments(),
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            successfulOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenueData = paymentAggregate[0] || { totalRevenue: 0, successfulOrders: 0 };
    const totalSessions =
      totalInterviews + totalAptitudeAttempts + totalGDSessions + totalResumeAnalyses;

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalRevenue: revenueData.totalRevenue,
        successfulOrders: revenueData.successfulOrders,
        totalSessions,
        modules: {
          interview: totalInterviews,
          aptitude: totalAptitudeAttempts,
          gd: totalGDSessions,
          resume: totalResumeAnalyses,
        },
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAnalytics error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to compile platform analytics.",
    });
  }
};

/**
 * Retrieves a paginated directory of newsletter subscribers with optional email search.
 * GET /api/admin/newsletter
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getAllSubscribers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escapedQuery = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      filter.email = { $regex: escapedQuery, $options: "i" };
    }

    const [totalSubscribers, subscribers] = await Promise.all([
      NewsletterSubscriber.countDocuments(filter),
      NewsletterSubscriber.find(filter)
        .select("_id email source subscribedAt createdAt")
        .sort({ subscribedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalSubscribers / limit) || 1;

    return res.status(200).json({
      success: true,
      subscribers,
      pagination: {
        totalSubscribers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllSubscribers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve newsletter subscribers.",
    });
  }
};

/**
 * Removes a subscriber from the newsletter list.
 * DELETE /api/admin/newsletter/:id
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID format.",
      });
    }

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscriber removed successfully.",
    });
  } catch (error) {
    console.error("[Admin Controller] deleteSubscriber error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to remove subscriber.",
    });
  }
};

/**
 * Helper to resolve user ObjectIds matching search queries on candidate name or email.
 */
const getMatchingUserIds = async (searchQuery) => {
  if (!searchQuery) return [];
  const escaped = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const users = await User.find({
    $or: [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ],
  })
    .select("_id")
    .lean();
  return users.map((u) => u._id);
};

// ===========================================================================
// 2. INTERVIEWS
// ===========================================================================

/**
 * Paginated list of mock interview sessions with candidate lookup and search.
 * GET /api/admin/interviews
 */
export const getAllInterviews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escaped = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const userIds = await getMatchingUserIds(searchQuery);
      filter.$or = [
        { role: { $regex: escaped, $options: "i" } },
        { mode: { $regex: escaped, $options: "i" } },
        { status: { $regex: escaped, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [totalInterviews, interviews] = await Promise.all([
      Interview.countDocuments(filter),
      Interview.find(filter)
        .populate("userId", "name email")
        .select("_id userId role experience mode finalScore status questionCount createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalInterviews / limit) || 1;

    return res.status(200).json({
      success: true,
      interviews,
      pagination: {
        totalInterviews,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllInterviews error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve interviews." });
  }
};

/**
 * Full details of a single interview session.
 * GET /api/admin/interviews/:id
 */
export const getInterviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID format." });
    }

    const interview = await Interview.findById(id)
      .populate("userId", "name email credits createdAt")
      .lean();

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    return res.status(200).json({ success: true, interview });
  } catch (error) {
    console.error("[Admin Controller] getInterviewDetail error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve interview details." });
  }
};

/**
 * Deletes an interview session.
 * DELETE /api/admin/interviews/:id
 */
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID format." });
    }

    const interview = await Interview.findByIdAndDelete(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    return res.status(200).json({ success: true, message: "Interview session deleted successfully." });
  } catch (error) {
    console.error("[Admin Controller] deleteInterview error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete interview." });
  }
};

// ===========================================================================
// 3. APTITUDE ATTEMPTS
// ===========================================================================

/**
 * Paginated list of aptitude test attempts with candidate lookup and search.
 * GET /api/admin/aptitude
 */
export const getAllAptitudeAttempts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escaped = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const userIds = await getMatchingUserIds(searchQuery);
      filter.$or = [
        { topic: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { difficulty: { $regex: escaped, $options: "i" } },
        { status: { $regex: escaped, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [totalAttempts, attempts] = await Promise.all([
      AptitudeAttempt.countDocuments(filter),
      AptitudeAttempt.find(filter)
        .populate("userId", "name email")
        .select("_id userId category topic difficulty score totalMarks accuracy status timeTakenSeconds questionCount createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalAttempts / limit) || 1;

    return res.status(200).json({
      success: true,
      attempts,
      pagination: {
        totalAttempts,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllAptitudeAttempts error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve aptitude attempts." });
  }
};

/**
 * Full details of a single aptitude attempt.
 * GET /api/admin/aptitude/:id
 */
export const getAptitudeAttemptDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid aptitude attempt ID format." });
    }

    const attempt = await AptitudeAttempt.findById(id)
      .populate("userId", "name email credits createdAt")
      .lean();

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Aptitude attempt not found." });
    }

    return res.status(200).json({ success: true, attempt });
  } catch (error) {
    console.error("[Admin Controller] getAptitudeAttemptDetail error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve aptitude attempt details." });
  }
};

/**
 * Deletes an aptitude attempt.
 * DELETE /api/admin/aptitude/:id
 */
export const deleteAptitudeAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid aptitude attempt ID format." });
    }

    const attempt = await AptitudeAttempt.findByIdAndDelete(id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Aptitude attempt not found." });
    }

    return res.status(200).json({ success: true, message: "Aptitude attempt deleted successfully." });
  } catch (error) {
    console.error("[Admin Controller] deleteAptitudeAttempt error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete aptitude attempt." });
  }
};

// ===========================================================================
// 4. GD SESSIONS
// ===========================================================================

/**
 * Paginated list of group discussion sessions with candidate lookup and search.
 * GET /api/admin/gd
 */
export const getAllGDSessions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escaped = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const userIds = await getMatchingUserIds(searchQuery);
      filter.$or = [
        { topic: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { difficulty: { $regex: escaped, $options: "i" } },
        { status: { $regex: escaped, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [totalSessions, sessions] = await Promise.all([
      GDSession.countDocuments(filter),
      GDSession.find(filter)
        .populate("userId", "name email")
        .select("_id userId topic category difficulty durationMinutes status evaluation.overallScore createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalSessions / limit) || 1;

    return res.status(200).json({
      success: true,
      sessions,
      pagination: {
        totalSessions,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllGDSessions error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve GD sessions." });
  }
};

/**
 * Full details of a single GD session.
 * GET /api/admin/gd/:id
 */
export const getGDSessionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid GD session ID format." });
    }

    const session = await GDSession.findById(id)
      .populate("userId", "name email credits createdAt")
      .lean();

    if (!session) {
      return res.status(404).json({ success: false, message: "GD session not found." });
    }

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("[Admin Controller] getGDSessionDetail error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve GD session details." });
  }
};

/**
 * Deletes a GD session.
 * DELETE /api/admin/gd/:id
 */
export const deleteGDSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid GD session ID format." });
    }

    const session = await GDSession.findByIdAndDelete(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "GD session not found." });
    }

    return res.status(200).json({ success: true, message: "GD session deleted successfully." });
  } catch (error) {
    console.error("[Admin Controller] deleteGDSession error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete GD session." });
  }
};

// ===========================================================================
// 5. RESUME ANALYSES
// ===========================================================================

/**
 * Paginated list of resume analyses with candidate lookup and search.
 * GET /api/admin/resume
 */
export const getAllResumeAnalyses = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escaped = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const userIds = await getMatchingUserIds(searchQuery);
      filter.$or = [
        { targetRole: { $regex: escaped, $options: "i" } },
        { experienceLevel: { $regex: escaped, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [totalAnalyses, analyses] = await Promise.all([
      ResumeAnalysis.countDocuments(filter),
      ResumeAnalysis.find(filter)
        .populate("userId", "name email")
        .select("_id userId targetRole experienceLevel resumeScore atsScore interviewReadinessScore createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalAnalyses / limit) || 1;

    return res.status(200).json({
      success: true,
      analyses,
      pagination: {
        totalAnalyses,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllResumeAnalyses error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve resume analyses." });
  }
};

/**
 * Full details of a single resume analysis.
 * GET /api/admin/resume/:id
 */
export const getResumeAnalysisDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid resume analysis ID format." });
    }

    const analysis = await ResumeAnalysis.findById(id)
      .populate("userId", "name email credits createdAt")
      .lean();

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Resume analysis not found." });
    }

    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    console.error("[Admin Controller] getResumeAnalysisDetail error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve resume analysis details." });
  }
};

/**
 * Deletes a resume analysis record.
 * DELETE /api/admin/resume/:id
 */
export const deleteResumeAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid resume analysis ID format." });
    }

    const analysis = await ResumeAnalysis.findByIdAndDelete(id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Resume analysis not found." });
    }

    return res.status(200).json({ success: true, message: "Resume analysis deleted successfully." });
  } catch (error) {
    console.error("[Admin Controller] deleteResumeAnalysis error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete resume analysis." });
  }
};

// ===========================================================================
// 6. PAYMENTS (IMMUTABLE AUDIT RECORDS)
// ===========================================================================

/**
 * Paginated list of payment transactions with candidate lookup and search.
 * GET /api/admin/payments
 */
export const getAllPayments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = req.query.q?.trim();

    const filter = {};
    if (searchQuery) {
      const escaped = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const userIds = await getMatchingUserIds(searchQuery);
      filter.$or = [
        { planId: { $regex: escaped, $options: "i" } },
        { status: { $regex: escaped, $options: "i" } },
        { razorpayOrderId: { $regex: escaped, $options: "i" } },
        { razorpayPaymentId: { $regex: escaped, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [totalPayments, payments] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(filter)
        .populate("userId", "name email")
        .select("_id userId planId amount credits razorpayOrderId razorpayPaymentId status createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalPayments / limit) || 1;

    return res.status(200).json({
      success: true,
      payments,
      pagination: {
        totalPayments,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[Admin Controller] getAllPayments error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve payments." });
  }
};

/**
 * Full details of a single payment transaction.
 * GET /api/admin/payments/:id
 */
export const getPaymentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid payment ID format." });
    }

    const payment = await Payment.findById(id)
      .populate("userId", "name email credits createdAt")
      .lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment transaction not found." });
    }

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("[Admin Controller] getPaymentDetail error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve payment details." });
  }
};



