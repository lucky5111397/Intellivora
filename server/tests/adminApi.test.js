import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import GDSession from "../models/gdSession.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import Payment from "../models/payment.model.js";

import jwt from "jsonwebtoken";
import isAdmin from "../middlewares/isAdmin.js";
import isAuth from "../middlewares/isAuth.js";
import { googleAuth, phoneAuth } from "../controllers/auth.controller.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserCredits,
  getAnalytics,
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
import { getCurrentUser } from "../controllers/user.controller.js";
import { getPlanDisplayName } from "../controllers/payment.controller.js";

const createMockReqRes = ({
  userId = new mongoose.Types.ObjectId().toString(),
  body = {},
  params = {},
  query = {},
  headers = {},
  cookies = {},
} = {}) => {
  const req = {
    userId,
    body,
    params,
    query,
    headers,
    cookies,
  };

  const res = {
    statusCode: 200,
    _json: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this._json = data;
      return this;
    },
  };

  return { req, res };
};

describe("Admin Panel Backend API & Security", () => {
  const adminEmail = "luvy4661@gmail.com";
  const adminUserId = new mongoose.Types.ObjectId();
  const regularUserId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    process.env.ADMIN_EMAIL = adminEmail;
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test_jwt_secret";
  });

  afterEach(() => {
    mock.restoreAll();
  });

  describe("1. isAdmin Middleware", () => {
    it("should reject when req.userId is missing with 401", async () => {
      const { req, res } = createMockReqRes({ userId: null });
      let nextCalled = false;

      await isAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 401);
      assert.match(res._json.message, /Authentication required/i);
    });

    it("should reject non-admin user with 403 Forbidden", async () => {
      mock.method(User, "findById", () => ({
        select: () => Promise.resolve({ _id: regularUserId, email: "regular@example.com" }),
      }));

      const { req, res } = createMockReqRes({ userId: regularUserId.toString() });
      let nextCalled = false;

      await isAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.match(res._json.message, /Forbidden/i);
    });

    it("should allow admin user (case-insensitive & trimmed) and call next()", async () => {
      mock.method(User, "findById", () => ({
        select: () => Promise.resolve({ _id: adminUserId, email: "  LUVY4661@GMAIL.COM  " }),
      }));

      const { req, res } = createMockReqRes({ userId: adminUserId.toString() });
      let nextCalled = false;

      await isAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.ok(req.adminUser);
    });
  });

  describe("2. getAllUsers & Plan Aggregation", () => {
    it("should return paginated users with aggregated currentPlan and newest first", async () => {
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "User 1",
          email: "u1@test.com",
          credits: 100,
          latestPayment: [{ planId: "basic" }],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "User 2",
          email: "u2@test.com",
          credits: 200,
          latestPayment: [{ planId: "pro" }],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "User 3",
          email: "u3@test.com",
          credits: 50,
          latestPayment: [],
        },
      ];

      mock.method(User, "countDocuments", () => Promise.resolve(25));
      mock.method(User, "aggregate", () => Promise.resolve(mockUsers));

      const { req, res } = createMockReqRes({ query: { page: "1", limit: "10" } });
      await getAllUsers(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.users.length, 3);
      assert.equal(res._json.users[0].currentPlan, "Pro");
      assert.equal(res._json.users[1].currentPlan, "Ultra");
      assert.equal(res._json.users[2].currentPlan, null);
      assert.equal(res._json.users[0].latestPayment, undefined);
      assert.equal(res._json.pagination.totalUsers, 25);
      assert.equal(res._json.pagination.totalPages, 3);
    });

    it("should correctly resolve display names for plan IDs and legacy aliases", () => {
      assert.equal(getPlanDisplayName("basic"), "Pro");
      assert.equal(getPlanDisplayName("starter"), "Pro");
      assert.equal(getPlanDisplayName("pro"), "Ultra");
      assert.equal(getPlanDisplayName("ultra"), "Ultra");
      assert.equal(getPlanDisplayName("free"), "Free");
      assert.equal(getPlanDisplayName(null), "Free");
      assert.equal(getPlanDisplayName(undefined), "Free");
    });
  });

  describe("getCurrentUser & Active Plan Resolution", () => {
    it("should resolve currentPlan from latest paid payment", async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        name: "Test Candidate",
        email: "candidate@test.com",
        credits: 500,
        toObject() {
          return {
            _id: this._id,
            name: this.name,
            email: this.email,
            credits: this.credits,
          };
        },
      };

      mock.method(User, "findById", () => ({
        select: () => Promise.resolve(mockUser),
      }));

      mock.method(Payment, "findOne", () => ({
        sort: () => ({
          select: () => ({
            lean: () => Promise.resolve({ planId: "basic" }),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ userId: userId.toString() });
      await getCurrentUser(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.currentPlan, "Pro");
    });

    it("should return currentPlan: null when user has no payments", async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        name: "Free Candidate",
        email: "free@test.com",
        credits: 100,
        toObject() {
          return {
            _id: this._id,
            name: this.name,
            email: this.email,
            credits: this.credits,
          };
        },
      };

      mock.method(User, "findById", () => ({
        select: () => Promise.resolve(mockUser),
      }));

      mock.method(Payment, "findOne", () => ({
        sort: () => ({
          select: () => ({
            lean: () => Promise.resolve(null),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ userId: userId.toString() });
      await getCurrentUser(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.currentPlan, null);
    });
  });

  describe("3. updateUserCredits", () => {
    it("should increment/decrement credits relative to current balance", async () => {
      const targetUser = {
        _id: regularUserId,
        name: "Test User",
        email: "test@user.com",
        credits: 100,
        save: () => Promise.resolve(),
      };

      mock.method(User, "findById", () => Promise.resolve(targetUser));

      const { req, res } = createMockReqRes({
        params: { id: regularUserId.toString() },
        body: { amount: 50 },
      });

      await updateUserCredits(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(targetUser.credits, 150);
      assert.equal(res._json.user.credits, 150);
    });

    it("should set credits to an absolute value and clamp to minimum 0", async () => {
      const targetUser = {
        _id: regularUserId,
        name: "Test User",
        email: "test@user.com",
        credits: 100,
        save: () => Promise.resolve(),
      };

      mock.method(User, "findById", () => Promise.resolve(targetUser));

      const { req, res } = createMockReqRes({
        params: { id: regularUserId.toString() },
        body: { newCredits: -20 }, // below zero
      });

      await updateUserCredits(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(targetUser.credits, 0); // clamped to 0
    });
  });

  describe("4. getAnalytics", () => {
    it("should compile aggregate metrics from all 5 collections and payments", async () => {
      mock.method(User, "countDocuments", () => Promise.resolve(150));
      mock.method(Interview, "countDocuments", () => Promise.resolve(320));
      mock.method(AptitudeAttempt, "countDocuments", () => Promise.resolve(450));
      mock.method(GDSession, "countDocuments", () => Promise.resolve(85));
      mock.method(ResumeAnalysis, "countDocuments", () => Promise.resolve(210));
      mock.method(Payment, "aggregate", () =>
        Promise.resolve([{ _id: null, totalRevenue: 15499, successfulOrders: 42 }])
      );

      const { req, res } = createMockReqRes();
      await getAnalytics(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.analytics.totalUsers, 150);
      assert.equal(res._json.analytics.totalRevenue, 15499);
      assert.equal(res._json.analytics.successfulOrders, 42);
      assert.equal(res._json.analytics.modules.interview, 320);
      assert.equal(res._json.analytics.modules.aptitude, 450);
      assert.equal(res._json.analytics.modules.gd, 85);
      assert.equal(res._json.analytics.modules.resume, 210);
      assert.equal(res._json.analytics.totalSessions, 320 + 450 + 85 + 210);
    });
  });

  describe("5. updateUser and deleteUser", () => {
    it("should update user name and status flags (isActive, isBanned)", async () => {
      const mockUser = {
        _id: regularUserId,
        name: "Old Name",
        email: "u@test.com",
        credits: 50,
        isActive: true,
        isBanned: false,
        createdAt: new Date(),
        save: () => Promise.resolve(),
      };

      mock.method(User, "findById", () => Promise.resolve(mockUser));

      const { req, res } = createMockReqRes({
        params: { id: regularUserId.toString() },
        body: { name: "New Name", isActive: false, isBanned: true },
      });

      await updateUser(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(mockUser.name, "New Name");
      assert.equal(mockUser.isActive, false);
      assert.equal(mockUser.isBanned, true);
    });

    it("should delete user account without cascading deletion", async () => {
      mock.method(User, "findByIdAndDelete", () =>
        Promise.resolve({ _id: regularUserId, name: "Deleted User" })
      );

      const { req, res } = createMockReqRes({
        params: { id: regularUserId.toString() },
      });

      await deleteUser(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.match(res._json.message, /deleted successfully/i);
    });
  });

  describe("6. Interviews Management", () => {
    const interviewId = new mongoose.Types.ObjectId();

    it("should get paginated interviews list", async () => {
      mock.method(Interview, "countDocuments", () => Promise.resolve(10));
      mock.method(Interview, "find", () => ({
        populate: () => ({
          select: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: () => Promise.resolve([{ _id: interviewId, role: "Frontend Dev" }]),
                }),
              }),
            }),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ query: { page: "1", limit: "10" } });
      await getAllInterviews(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.interviews.length, 1);
      assert.equal(res._json.pagination.totalInterviews, 10);
    });

    it("should get single interview details", async () => {
      mock.method(Interview, "findById", () => ({
        populate: () => ({
          lean: () =>
            Promise.resolve({
              _id: interviewId,
              role: "Frontend Dev",
              questions: [{ question: "What is React?", score: 9 }],
            }),
        }),
      }));

      const { req, res } = createMockReqRes({ params: { id: interviewId.toString() } });
      await getInterviewDetail(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.interview.role, "Frontend Dev");
    });

    it("should delete an interview session", async () => {
      mock.method(Interview, "findByIdAndDelete", () =>
        Promise.resolve({ _id: interviewId })
      );

      const { req, res } = createMockReqRes({ params: { id: interviewId.toString() } });
      await deleteInterview(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
    });
  });

  describe("7. Aptitude Management", () => {
    const attemptId = new mongoose.Types.ObjectId();

    it("should get paginated aptitude attempts", async () => {
      mock.method(AptitudeAttempt, "countDocuments", () => Promise.resolve(5));
      mock.method(AptitudeAttempt, "find", () => ({
        populate: () => ({
          select: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: () => Promise.resolve([{ _id: attemptId, topic: "Percentages" }]),
                }),
              }),
            }),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ query: { page: "1", limit: "10" } });
      await getAllAptitudeAttempts(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.attempts.length, 1);
    });

    it("should get single aptitude attempt detail", async () => {
      mock.method(AptitudeAttempt, "findById", () => ({
        populate: () => ({
          lean: () =>
            Promise.resolve({
              _id: attemptId,
              topic: "Percentages",
              score: 8,
              totalMarks: 10,
            }),
        }),
      }));

      const { req, res } = createMockReqRes({ params: { id: attemptId.toString() } });
      await getAptitudeAttemptDetail(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.attempt.score, 8);
    });

    it("should delete an aptitude attempt", async () => {
      mock.method(AptitudeAttempt, "findByIdAndDelete", () =>
        Promise.resolve({ _id: attemptId })
      );

      const { req, res } = createMockReqRes({ params: { id: attemptId.toString() } });
      await deleteAptitudeAttempt(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
    });
  });

  describe("8. Group Discussion Management", () => {
    const sessionId = new mongoose.Types.ObjectId();

    it("should get paginated GD sessions", async () => {
      mock.method(GDSession, "countDocuments", () => Promise.resolve(8));
      mock.method(GDSession, "find", () => ({
        populate: () => ({
          select: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: () => Promise.resolve([{ _id: sessionId, topic: "AI in Healthcare" }]),
                }),
              }),
            }),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ query: { page: "1", limit: "10" } });
      await getAllGDSessions(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.sessions.length, 1);
    });

    it("should get single GD session detail", async () => {
      mock.method(GDSession, "findById", () => ({
        populate: () => ({
          lean: () =>
            Promise.resolve({
              _id: sessionId,
              topic: "AI in Healthcare",
              evaluation: { overallScore: 88 },
            }),
        }),
      }));

      const { req, res } = createMockReqRes({ params: { id: sessionId.toString() } });
      await getGDSessionDetail(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.session.evaluation.overallScore, 88);
    });

    it("should delete a GD session", async () => {
      mock.method(GDSession, "findByIdAndDelete", () =>
        Promise.resolve({ _id: sessionId })
      );

      const { req, res } = createMockReqRes({ params: { id: sessionId.toString() } });
      await deleteGDSession(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
    });
  });

  describe("9. Resume Analyses Management", () => {
    const analysisId = new mongoose.Types.ObjectId();

    it("should get paginated resume analyses", async () => {
      mock.method(ResumeAnalysis, "countDocuments", () => Promise.resolve(12));
      mock.method(ResumeAnalysis, "find", () => ({
        populate: () => ({
          select: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: () => Promise.resolve([{ _id: analysisId, targetRole: "Full Stack" }]),
                }),
              }),
            }),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ query: { page: "1", limit: "10" } });
      await getAllResumeAnalyses(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.analyses.length, 1);
    });

    it("should get single resume analysis detail", async () => {
      mock.method(ResumeAnalysis, "findById", () => ({
        populate: () => ({
          lean: () =>
            Promise.resolve({
              _id: analysisId,
              targetRole: "Full Stack",
              atsScore: 82,
            }),
        }),
      }));

      const { req, res } = createMockReqRes({ params: { id: analysisId.toString() } });
      await getResumeAnalysisDetail(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.analysis.atsScore, 82);
    });

    it("should delete a resume analysis", async () => {
      mock.method(ResumeAnalysis, "findByIdAndDelete", () =>
        Promise.resolve({ _id: analysisId })
      );

      const { req, res } = createMockReqRes({ params: { id: analysisId.toString() } });
      await deleteResumeAnalysis(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
    });
  });

  describe("10. Payments Ledger (Read-Only Audit)", () => {
    const paymentId = new mongoose.Types.ObjectId();

    it("should get paginated payments list", async () => {
      mock.method(Payment, "countDocuments", () => Promise.resolve(20));
      mock.method(Payment, "find", () => ({
        populate: () => ({
          select: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: () => Promise.resolve([{ _id: paymentId, amount: 499, status: "paid" }]),
                }),
              }),
            }),
          }),
        }),
      }));

      const { req, res } = createMockReqRes({ query: { page: "1", limit: "10" } });
      await getAllPayments(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.payments.length, 1);
      assert.equal(res._json.pagination.totalPayments, 20);
    });

    it("should get single payment detail for audit", async () => {
      mock.method(Payment, "findById", () => ({
        populate: () => ({
          lean: () =>
            Promise.resolve({
              _id: paymentId,
              amount: 499,
              credits: 100,
              status: "paid",
              razorpayOrderId: "order_12345",
            }),
        }),
      }));

      const { req, res } = createMockReqRes({ params: { id: paymentId.toString() } });
      await getPaymentDetail(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.payment.amount, 499);
      assert.equal(res._json.payment.razorpayOrderId, "order_12345");
    });
  });

  describe("11. Banned and Inactive User Access Controls", () => {
    it("should reject login attempt for a banned user in googleAuth with 403", async () => {
      mock.method(User, "findOne", () =>
        Promise.resolve({
          _id: regularUserId,
          email: "banned@test.com",
          name: "Banned User",
          isBanned: true,
          isActive: true,
        })
      );

      const { req, res } = createMockReqRes({
        body: { email: "banned@test.com", name: "Banned User" },
      });

      await googleAuth(req, res);

      assert.equal(res.statusCode, 403);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /suspended/i);
    });

    it("should reject login attempt for a deactivated user in googleAuth with 403", async () => {
      mock.method(User, "findOne", () =>
        Promise.resolve({
          _id: regularUserId,
          email: "inactive@test.com",
          name: "Inactive User",
          isBanned: false,
          isActive: false,
        })
      );

      const { req, res } = createMockReqRes({
        body: { email: "inactive@test.com", name: "Inactive User" },
      });

      await googleAuth(req, res);

      assert.equal(res.statusCode, 403);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /deactivated/i);
    });

    it("should reject login attempt for a banned user in phoneAuth with 403", async () => {
      mock.method(User, "findOne", () =>
        Promise.resolve({
          _id: regularUserId,
          phone: "+919876543210",
          name: "Banned Phone User",
          isBanned: true,
          isActive: true,
        })
      );

      const { req, res } = createMockReqRes({
        body: { phone: "+919876543210", name: "Banned Phone User" },
      });

      await phoneAuth(req, res);

      assert.equal(res.statusCode, 403);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /suspended/i);
    });

    it("should block active session of a banned user in isAuth middleware with 403", async () => {
      process.env.JWT_SECRET = "test_jwt_secret";
      const token = jwt.sign({ userId: regularUserId.toString() }, process.env.JWT_SECRET);

      mock.method(User, "findById", () => ({
        select: () => Promise.resolve({ _id: regularUserId, isBanned: true, isActive: true }),
      }));

      const { req, res } = createMockReqRes({
        cookies: { token },
      });
      let nextCalled = false;

      await isAuth(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /suspended/i);
    });

    it("should block active session of an inactive user in isAuth middleware with 403", async () => {
      process.env.JWT_SECRET = "test_jwt_secret";
      const token = jwt.sign({ userId: regularUserId.toString() }, process.env.JWT_SECRET);

      mock.method(User, "findById", () => ({
        select: () => Promise.resolve({ _id: regularUserId, isBanned: false, isActive: false }),
      }));

      const { req, res } = createMockReqRes({
        cookies: { token },
      });
      let nextCalled = false;

      await isAuth(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /deactivated/i);
    });
  });
});
