import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import GDSession from "../models/gdSession.model.js";
import User from "../models/user.model.js";
import isAuth from "../middlewares/isAuth.js";
import gdRouter from "../Routes/gd.route.js";
import { GD_CREDIT_COST } from "../config/credits.config.js";
import {
  createSession,
  getSession,
  getOverview,
  setLobbyReady,
  submitTurn,
  completeSession,
  abortSession,
  setAICaller,
  resetAICaller,
} from "../controllers/gd.controller.js";

// Helper to create mock Express req & res
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
    headersSent: false,
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

describe("GD Backend REST API (Issue #10 / GD-03)", () => {
  const testUserId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    process.env.JWT_SECRET = "test_jwt_secret_key_12345";
    resetAICaller();
  });

  afterEach(() => {
    mock.restoreAll();
    resetAICaller();
  });

  // =============================================================
  // 1. Router Configuration & Authentication Middleware
  // =============================================================
  describe("Router & isAuth Middleware", () => {
    it("should mount all required GD routes on gdRouter", () => {
      // In Express 5, router.stack contains route layers
      const registeredRoutes = gdRouter.stack
        .filter((layer) => layer.route)
        .map((layer) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

      const expectedPaths = [
        "/overview",
        "/session/create",
        "/session/:id",
        "/session/:id/lobby-ready",
        "/session/:id/turn",
        "/session/:id/complete",
        "/session/:id/abort",
      ];

      for (const expected of expectedPaths) {
        const found = registeredRoutes.find((r) => r.path === expected);
        assert.ok(found, `Route ${expected} should be registered on gdRouter`);
      }
    });

    it("should reject unauthenticated request with 401 when no token provided", async () => {
      const { req, res } = createMockReqRes();
      let nextCalled = false;

      await isAuth(req, res, () => {
        nextCalled = true;
      });

      assert.equal(res.statusCode, 401);
      assert.equal(res._json.success, false);
      assert.equal(nextCalled, false);
    });

    it("should reject invalid token format with 401", async () => {
      const { req, res } = createMockReqRes({
        headers: { authorization: "Bearer " }, // empty bearer
      });
      let nextCalled = false;

      await isAuth(req, res, () => {
        nextCalled = true;
      });

      assert.equal(res.statusCode, 401);
      assert.equal(nextCalled, false);
    });

    it("should reject expired or invalid signature token with 401", async () => {
      const invalidToken = jwt.sign(
        { userId: testUserId.toString() },
        "wrong_secret"
      );
      const { req, res } = createMockReqRes({
        cookies: { token: invalidToken },
      });
      let nextCalled = false;

      await isAuth(req, res, () => {
        nextCalled = true;
      });

      assert.equal(res.statusCode, 401);
      assert.equal(nextCalled, false);
    });

    it("should authenticate valid JWT from cookie or Bearer header", async () => {
      const validToken = jwt.sign(
        { userId: testUserId.toString() },
        process.env.JWT_SECRET
      );

      // Via cookie
      const cookieTest = createMockReqRes({ cookies: { token: validToken } });
      let next1 = false;
      await isAuth(cookieTest.req, cookieTest.res, () => {
        next1 = true;
      });
      assert.equal(next1, true);
      assert.equal(cookieTest.req.userId, testUserId.toString());

      // Via Bearer header
      const headerTest = createMockReqRes({
        headers: { authorization: `Bearer ${validToken}` },
      });
      let next2 = false;
      await isAuth(headerTest.req, headerTest.res, () => {
        next2 = true;
      });
      assert.equal(next2, true);
      assert.equal(headerTest.req.userId, testUserId.toString());
    });
  });

  // =============================================================
  // 2. POST /api/gd/session/create
  // =============================================================
  describe("POST /api/gd/session/create", () => {
    it("should reject missing or invalid input fields with 400", async () => {
      // Missing idempotencyKey
      const test1 = createMockReqRes({
        body: { topic: "Test Topic", category: "Technology & AI" },
      });
      await createSession(test1.req, test1.res, () => {});
      assert.equal(test1.res.statusCode, 400);
      assert.match(test1.res._json.message, /Idempotency key/i);

      // Topic too short (< 5 chars)
      const test2 = createMockReqRes({
        body: {
          idempotencyKey: "uuid-1",
          topic: "abc",
          category: "Technology & AI",
        },
      });
      await createSession(test2.req, test2.res, () => {});
      assert.equal(test2.res.statusCode, 400);
      assert.match(test2.res._json.message, /Topic must be/i);

      // Invalid category
      const test3 = createMockReqRes({
        body: {
          idempotencyKey: "uuid-1",
          topic: "Valid Topic Name Here",
          category: "FakeCategory",
        },
      });
      await createSession(test3.req, test3.res, () => {});
      assert.equal(test3.res.statusCode, 400);
      assert.match(test3.res._json.message, /Invalid category/i);

      // Invalid duration (< 3 or > 30)
      const test4 = createMockReqRes({
        body: {
          idempotencyKey: "uuid-1",
          topic: "Valid Topic Name Here",
          category: "Technology & AI",
          durationMinutes: 45,
        },
      });
      await createSession(test4.req, test4.res, () => {});
      assert.equal(test4.res.statusCode, 400);
      assert.match(test4.res._json.message, /Duration must be/i);
    });

    it("should reject session creation if user has insufficient credits (< 150)", async () => {
      mock.method(GDSession, "findOne", async () => null);
      // Atomic findOneAndUpdate returns null when credits < GD_CREDIT_COST
      mock.method(User, "findOneAndUpdate", async () => null);
      mock.method(User, "findById", () => ({
        select: async () => ({ credits: 50 }),
      }));

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        body: {
          idempotencyKey: "unique-uuid-123",
          topic: "Should AI Have Legal Personhood?",
          category: "Technology & AI",
          difficulty: "mid",
          durationMinutes: 10,
        },
      });

      await createSession(req, res, () => {});

      assert.equal(res.statusCode, 400);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /Insufficient credits/i);
      assert.equal(res._json.creditsLeft, 50);
    });

    it("should successfully deduct credits and create session in 'setup' status", async () => {
      mock.method(GDSession, "findOne", async () => null);
      mock.method(User, "findOneAndUpdate", async () => ({
        _id: testUserId,
        credits: 350,
      }));

      const createdDoc = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        idempotencyKey: "unique-uuid-456",
        topic: "Should AI Have Legal Personhood?",
        category: "Technology & AI",
        difficulty: "mid",
        durationMinutes: 10,
        maxTurns: 30,
        creditsDeducted: GD_CREDIT_COST,
        status: "setup",
      };
      mock.method(GDSession, "create", async () => createdDoc);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        body: {
          idempotencyKey: "unique-uuid-456",
          topic: "Should AI Have Legal Personhood?",
          category: "Technology & AI",
          difficulty: "mid",
          durationMinutes: 10,
        },
      });

      await createSession(req, res, () => {});

      assert.equal(res.statusCode, 201);
      assert.equal(res._json.success, true);
      assert.equal(res._json.status, "setup");
      assert.equal(res._json.creditsLeft, 350);
      assert.equal(res._json.sessionId.toString(), createdDoc._id.toString());
    });

    it("should safely return existing session on idempotent duplicate request without double deduction", async () => {
      const existingDoc = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        idempotencyKey: "duplicate-uuid-789",
        topic: "Should AI Have Legal Personhood?",
        category: "Technology & AI",
        status: "setup",
      };

      // Existing session found on pre-check
      mock.method(GDSession, "findOne", async () => existingDoc);
      mock.method(User, "findById", () => ({
        select: async () => ({ credits: 350 }),
      }));

      // Ensure User.findOneAndUpdate is NOT called
      let userUpdateCalled = false;
      mock.method(User, "findOneAndUpdate", async () => {
        userUpdateCalled = true;
        return null;
      });

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        body: {
          idempotencyKey: "duplicate-uuid-789",
          topic: "Should AI Have Legal Personhood?",
          category: "Technology & AI",
        },
      });

      await createSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.sessionId.toString(), existingDoc._id.toString());
      assert.equal(userUpdateCalled, false, "Credits must NOT be deducted on duplicate request");
    });

    it("should safely handle concurrent duplicate race condition (code 11000) and refund credits", async () => {
      // First findOne returns null (simulating concurrent race)
      let findCount = 0;
      const existingDoc = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        idempotencyKey: "concurrent-uuid-999",
        status: "setup",
      };

      mock.method(GDSession, "findOne", async () => {
        findCount++;
        return findCount === 1 ? null : existingDoc;
      });

      mock.method(User, "findOneAndUpdate", async () => ({
        _id: testUserId,
        credits: 350,
      }));

      let refundedCredits = 0;
      mock.method(User, "findByIdAndUpdate", async (id, update) => {
        refundedCredits += update.$inc.credits;
        return { _id: id };
      });

      mock.method(User, "findById", () => ({
        select: async () => ({ credits: 500 }),
      }));

      // Simulate MongoDB E11000 duplicate key error on create
      const dupError = new Error("E11000 duplicate key error");
      dupError.code = 11000;
      mock.method(GDSession, "create", async () => {
        throw dupError;
      });

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        body: {
          idempotencyKey: "concurrent-uuid-999",
          topic: "Should AI Have Legal Personhood?",
          category: "Technology & AI",
        },
      });

      await createSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(refundedCredits, GD_CREDIT_COST, "Deducted credits must be refunded on E11000 race");
    });
  });

  // =============================================================
  // 3. GET /api/gd/session/:id & Ownership Isolation
  // =============================================================
  describe("GET /api/gd/session/:id", () => {
    it("should reject invalid ObjectId format with 400", async () => {
      const { req, res } = createMockReqRes({
        params: { id: "not-a-valid-object-id" },
      });

      await getSession(req, res, () => {});

      assert.equal(res.statusCode, 400);
      assert.match(res._json.message, /Invalid session ID/i);
    });

    it("should return 404 if session does not exist", async () => {
      mock.method(GDSession, "findById", async () => null);

      const { req, res } = createMockReqRes({
        params: { id: new mongoose.Types.ObjectId().toString() },
      });

      await getSession(req, res, () => {});

      assert.equal(res.statusCode, 404);
      assert.match(res._json.message, /Session not found/i);
    });

    it("should enforce strict ownership isolation with 403 Forbidden", async () => {
      const sessionBelongingToOtherUser = {
        _id: new mongoose.Types.ObjectId(),
        userId: otherUserId, // belongs to otherUserId
        topic: "Topic A",
        status: "in_progress",
      };

      mock.method(GDSession, "findById", async () => sessionBelongingToOtherUser);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(), // requested by testUserId
        params: { id: sessionBelongingToOtherUser._id.toString() },
      });

      await getSession(req, res, () => {});

      assert.equal(res.statusCode, 403);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /Unauthorized/i);
    });

    it("should return 200 with full session when requested by the owner", async () => {
      const mySession = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        topic: "Should AI Have Legal Personhood?",
        status: "in_progress",
        transcript: [
          { turnNumber: 1, speakerId: "orchestrator", content: "Welcome" },
        ],
        telemetry: { candidateTurnCount: 1 },
      };

      mock.method(GDSession, "findById", async () => mySession);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: mySession._id.toString() },
      });

      await getSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.session.topic, "Should AI Have Legal Personhood?");
      assert.equal(res._json.session.transcript.length, 1);
    });
  });

  // =============================================================
  // 4. GET /api/gd/overview
  // =============================================================
  describe("GET /api/gd/overview", () => {
    it("should calculate aggregate stats and top dimension for user with completed sessions", async () => {
      const mockSessions = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId: testUserId,
          status: "completed",
          evaluation: {
            overallScore: 85,
            breakdown: {
              articulation: 90,
              leadership: 80,
              listening: 85,
              criticalThinking: 85,
            },
          },
          createdAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: testUserId,
          status: "completed",
          evaluation: {
            overallScore: 75,
            breakdown: {
              articulation: 80,
              leadership: 70,
              listening: 75,
              criticalThinking: 75,
            },
          },
          createdAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: testUserId,
          status: "aborted",
          createdAt: new Date(),
        },
      ];

      mock.method(GDSession, "find", () => ({
        sort: () => ({
          lean: async () => mockSessions,
        }),
      }));

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
      });

      await getOverview(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.stats.totalCompleted, 2);
      assert.equal(res._json.stats.averageScore, 80);
      assert.equal(res._json.stats.topDimension, "Articulation & Clarity");
      assert.equal(res._json.stats.dimensionAverages.articulation, 85);
      assert.equal(res._json.recentSessions.length, 3);
    });

    it("should handle user with zero sessions gracefully", async () => {
      mock.method(GDSession, "find", () => ({
        sort: () => ({
          lean: async () => [],
        }),
      }));

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
      });

      await getOverview(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.stats.totalCompleted, 0);
      assert.equal(res._json.stats.averageScore, 0);
      assert.equal(res._json.stats.topDimension, "None");
      assert.equal(res._json.recentSessions.length, 0);
    });
  });

  // =============================================================
  // 5. POST /api/gd/session/:id/lobby-ready
  // =============================================================
  describe("POST /api/gd/session/:id/lobby-ready", () => {
    it("should transition status from 'setup' to 'in_progress'", async () => {
      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "setup",
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
      });

      await setLobbyReady(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.status, "in_progress");
      assert.equal(session.status, "in_progress");
      assert.equal(saved, true);
    });

    it("should reject transition if session is already completed or aborted with 409", async () => {
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "completed",
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
      });

      await setLobbyReady(req, res, () => {});

      assert.equal(res.statusCode, 409);
      assert.match(res._json.message, /Cannot enter live room/i);
    });
  });

  // =============================================================
  // 6. POST /api/gd/session/:id/turn
  // =============================================================
  describe("POST /api/gd/session/:id/turn", () => {
    it("should reject turn request if session status is not 'in_progress'", async () => {
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "setup", // not yet in_progress
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
        body: { turnType: "agent_prompt" },
      });

      await submitTurn(req, res, () => {});

      assert.equal(res.statusCode, 409);
      assert.match(res._json.message, /not in progress/i);
    });

    it("should generate orchestrator opening turn when transcript is empty", async () => {
      setAICaller(async () => "Welcome to the group discussion on legal personhood for AI.");

      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        topic: "Legal Personhood for AI",
        category: "Technology & AI",
        difficulty: "mid",
        status: "in_progress",
        maxTurns: 30,
        durationMinutes: 10,
        transcript: [],
        telemetry: {
          totalTurnsCount: 0,
          totalSessionDurationSeconds: 0,
          candidateTurnCount: 0,
        },
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
        body: { turnType: "agent_prompt" },
      });

      await submitTurn(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.turn.speakerId, "orchestrator");
      assert.equal(res._json.turn.speakerLabel, "System");
      assert.equal(res._json.isDiscussionComplete, false);
      assert.equal(session.transcript.length, 1);
      assert.equal(saved, true);
    });

    it("should process candidate speech and append subsequent AI agent turn", async () => {
      setAICaller(async () => "Agent 1 notes that legal liability models must account for algorithmic autonomy.");

      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        topic: "Legal Personhood for AI",
        category: "Technology & AI",
        difficulty: "mid",
        status: "in_progress",
        maxTurns: 30,
        durationMinutes: 10,
        transcript: [
          { turnNumber: 1, speakerId: "orchestrator", speakerLabel: "System", content: "Opening statement" },
        ],
        telemetry: {
          candidateSpeakingTimeSeconds: 0,
          candidateTurnCount: 0,
          totalTurnsCount: 1,
          totalSessionDurationSeconds: 10,
          interruptionsCount: 0,
          agent1SpeakingTimeSeconds: 0,
          agent2SpeakingTimeSeconds: 0,
          agent3SpeakingTimeSeconds: 0,
        },
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
        body: {
          turnType: "candidate_speech",
          content: "I believe legal personhood should only apply if moral agency can be proven.",
          durationSeconds: 15,
          interruptedPrevious: false,
        },
      });

      await submitTurn(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.candidateTurn.speakerId, "candidate");
      assert.equal(res._json.candidateTurn.speakerLabel, "You");
      assert.equal(res._json.turn.speakerId, "agent_1");
      assert.equal(res._json.isDiscussionComplete, false);

      // Verify transcript has 3 turns now (System, Candidate, Agent 1)
      assert.equal(session.transcript.length, 3);
      assert.equal(session.telemetry.candidateTurnCount, 1);
      assert.equal(session.telemetry.candidateSpeakingTimeSeconds, 15);
      assert.equal(saved, true);
    });

    it("should preserve session state and return 502 if AI agent generation fails", async () => {
      // Simulate AI provider outage
      setAICaller(async () => {
        const err = new Error("All AI providers unavailable");
        err.status = 502;
        throw err;
      });

      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        topic: "Legal Personhood for AI",
        category: "Technology & AI",
        difficulty: "mid",
        status: "in_progress",
        maxTurns: 30,
        durationMinutes: 10,
        transcript: [
          { turnNumber: 1, speakerId: "orchestrator", speakerLabel: "System", content: "Opening statement" },
        ],
        telemetry: {
          candidateSpeakingTimeSeconds: 0,
          candidateTurnCount: 0,
          totalTurnsCount: 1,
          totalSessionDurationSeconds: 10,
          interruptionsCount: 0,
        },
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
        body: {
          turnType: "candidate_speech",
          content: "Candidate input that should not leave half-committed state on AI failure.",
        },
      });

      await submitTurn(req, res, () => {});

      assert.equal(res.statusCode, 502);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /Session state has been preserved/i);
      // Ensure transcript was NOT modified in the database
      assert.equal(saved, false);
      assert.equal(session.transcript.length, 1);
    });
  });

  // =============================================================
  // 7. POST /api/gd/session/:id/complete
  // =============================================================
  describe("POST /api/gd/session/:id/complete", () => {
    it("should evaluate session, persist evaluation, and transition to 'completed'", async () => {
      setAICaller(async () =>
        JSON.stringify({
          overallScore: 84,
          breakdown: {
            articulation: 86,
            leadership: 80,
            listening: 85,
            criticalThinking: 85,
          },
          strengths: ["Clear logical structure"],
          improvements: ["Use more data examples"],
          detailedFeedback: "Strong performance throughout.",
          turnFeedback: [
            {
              turnNumber: 2,
              speakerLabel: "You",
              critiqueType: "strong_point",
              comment: "Great rebuttal.",
            },
          ],
        })
      );

      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        topic: "Legal Personhood for AI",
        category: "Technology & AI",
        difficulty: "mid",
        status: "in_progress",
        transcript: [
          { turnNumber: 1, speakerId: "orchestrator", speakerLabel: "System", content: "Opening" },
          { turnNumber: 2, speakerId: "candidate", speakerLabel: "You", content: "My argument" },
        ],
        telemetry: {
          candidateSpeakingTimeSeconds: 40,
          candidateTurnCount: 1,
          totalTurnsCount: 2,
          totalSessionDurationSeconds: 60,
          interruptionsCount: 0,
        },
        evaluation: null,
        activeSpeakerId: "candidate",
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
        body: {
          finalTelemetry: {
            candidateSpeakingTimeSeconds: 50,
            interruptionsCount: 1,
          },
        },
      });

      await completeSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.status, "completed");
      assert.equal(res._json.evaluation.overallScore, 84);
      assert.equal(session.status, "completed");
      assert.equal(session.activeSpeakerId, null);
      assert.equal(saved, true);
    });

    it("should return existing evaluation idempotently if session is already completed", async () => {
      const completedSession = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "completed",
        evaluation: {
          overallScore: 88,
        },
      };

      mock.method(GDSession, "findById", async () => completedSession);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: completedSession._id.toString() },
      });

      await completeSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.status, "completed");
      assert.equal(res._json.evaluation.overallScore, 88);
    });
  });

  // =============================================================
  // 8. POST /api/gd/session/:id/abort & Refund Protection
  // =============================================================
  describe("POST /api/gd/session/:id/abort", () => {
    it("should restore credits and mark refunded: true when candidate has taken 0 turns", async () => {
      let refundedCredits = 0;
      mock.method(User, "findByIdAndUpdate", async (id, update) => {
        refundedCredits += update.$inc.credits;
        return { _id: id };
      });

      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "setup",
        creditsDeducted: GD_CREDIT_COST,
        refunded: false,
        telemetry: {
          candidateTurnCount: 0,
        },
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
      });

      await abortSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.status, "aborted");
      assert.equal(res._json.refunded, true);
      assert.match(res._json.message, /refunded to your account/i);
      assert.equal(refundedCredits, GD_CREDIT_COST);
      assert.equal(session.status, "aborted");
      assert.equal(session.refunded, true);
      assert.equal(saved, true);
    });

    it("should NOT refund credits when candidate has taken 1 or more turns", async () => {
      let refundCalled = false;
      mock.method(User, "findByIdAndUpdate", async () => {
        refundCalled = true;
        return {};
      });

      let saved = false;
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "in_progress",
        creditsDeducted: GD_CREDIT_COST,
        refunded: false,
        telemetry: {
          candidateTurnCount: 2, // Candidate already participated
        },
        save: async function () {
          saved = true;
          return this;
        },
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
      });

      await abortSession(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res._json.status, "aborted");
      assert.equal(res._json.refunded, false);
      assert.match(res._json.message, /non-refundable/i);
      assert.equal(refundCalled, false, "Credits must NOT be refunded once candidate has spoken");
      assert.equal(session.status, "aborted");
      assert.equal(saved, true);
    });

    it("should reject aborting an already completed session with 409", async () => {
      const session = {
        _id: new mongoose.Types.ObjectId(),
        userId: testUserId,
        status: "completed",
      };

      mock.method(GDSession, "findById", async () => session);

      const { req, res } = createMockReqRes({
        userId: testUserId.toString(),
        params: { id: session._id.toString() },
      });

      await abortSession(req, res, () => {});

      assert.equal(res.statusCode, 409);
      assert.match(res._json.message, /Completed session cannot be aborted/i);
    });
  });
});
