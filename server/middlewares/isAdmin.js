import User from "../models/user.model.js";

/**
 * Administrative Authorization Guard
 * Enforces role-based access control by validating the authenticated user's email
 * against the authoritative ADMIN_EMAIL environment variable using case-insensitive comparison.
 * Requires `isAuth` to have executed previously (`req.userId` must exist).
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before admin verification.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!adminEmail) {
      console.error("[isAdmin] ADMIN_EMAIL is not configured in server environment.");
      return res.status(500).json({
        success: false,
        message: "Admin service configuration error.",
      });
    }

    const user = await User.findById(userId).select("email");

    if (!user || !user.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: User record not found or has no email.",
      });
    }

    const userEmail = user.email.trim().toLowerCase();

    if (userEmail !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin privileges required.",
      });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error("[isAdmin] Error verifying admin access:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify administrative authorization.",
    });
  }
};

export default isAdmin;

