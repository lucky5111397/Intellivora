import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserCredits,
  getAnalytics,
  getAllSubscribers,
  deleteSubscriber,
  getAllInterviews,
  getInterviewDetail,
  deleteInterview,
  getAllAptitudeAttempts,
  getAptitudeAttemptDetail,
  deleteAptitudeAttempt,
  getAllGDSessions,
  getGDSessionDetail,
  deleteGDSession,
  getAllResumeAnalyses,
  getResumeAnalysisDetail,
  deleteResumeAnalysis,
  getAllPayments,
  getPaymentDetail,
} from "../controllers/admin.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const adminRouter = express.Router();
adminRouter.use(generalLimiter);

// Apply isAuth and isAdmin guards to all administrative endpoints
// Users
adminRouter.get("/users", isAuth, isAdmin, getAllUsers);
adminRouter.patch("/users/:id", isAuth, isAdmin, updateUser);
adminRouter.patch("/users/:id/credits", isAuth, isAdmin, updateUserCredits);
adminRouter.delete("/users/:id", isAuth, isAdmin, deleteUser);

// Interviews
adminRouter.get("/interviews", isAuth, isAdmin, getAllInterviews);
adminRouter.get("/interviews/:id", isAuth, isAdmin, getInterviewDetail);
adminRouter.delete("/interviews/:id", isAuth, isAdmin, deleteInterview);

// Aptitude
adminRouter.get("/aptitude", isAuth, isAdmin, getAllAptitudeAttempts);
adminRouter.get("/aptitude/:id", isAuth, isAdmin, getAptitudeAttemptDetail);
adminRouter.delete("/aptitude/:id", isAuth, isAdmin, deleteAptitudeAttempt);

// Group Discussion
adminRouter.get("/gd", isAuth, isAdmin, getAllGDSessions);
adminRouter.get("/gd/:id", isAuth, isAdmin, getGDSessionDetail);
adminRouter.delete("/gd/:id", isAuth, isAdmin, deleteGDSession);

// ATS Resume Analyses
adminRouter.get("/resume", isAuth, isAdmin, getAllResumeAnalyses);
adminRouter.get("/resume/:id", isAuth, isAdmin, getResumeAnalysisDetail);
adminRouter.delete("/resume/:id", isAuth, isAdmin, deleteResumeAnalysis);

// Payments (Immutable Audit Records)
adminRouter.get("/payments", isAuth, isAdmin, getAllPayments);
adminRouter.get("/payments/:id", isAuth, isAdmin, getPaymentDetail);

// Newsletter Subscribers
adminRouter.get("/newsletter", isAuth, isAdmin, getAllSubscribers);
adminRouter.delete("/newsletter/:id", isAuth, isAdmin, deleteSubscriber);

// Analytics
adminRouter.get("/analytics", isAuth, isAdmin, getAnalytics);

export default adminRouter;

