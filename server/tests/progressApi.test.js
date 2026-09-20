import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import Interview from "../models/interview.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";
import GDSession from "../models/gdSession.model.js";
import { getProgressAnalytics } from "../controllers/history.controller.js";

const createMockReqRes = ({
  userId = new mongoose.Types.ObjectId().toString(),
  body = {},
  params = {},
  query = {},
} = {}) => {
  const req = {
    userId,
    body,
    params,
    query,
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

const createMockQuery = (data) => ({
  select: () => ({
    sort: () => ({
      lean: async () => data,
    }),
  }),
});

describe("Progress Analytics API (GET /api/history/progress)", () => {
  const testUserId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    mock.restoreAll();
  });

  it("should return clean empty state when user has no activity", async () => {
    mock.method(Interview, "find", () => createMockQuery([]));
    mock.method(AptitudeAttempt, "find", () => createMockQuery([]));
    mock.method(GDSession, "find", () => createMockQuery([]));

    const { req, res } = createMockReqRes({ userId: testUserId });
    await getProgressAnalytics(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res._json.interviewTrend, []);
    assert.deepEqual(res._json.aptitudeTrend, []);
    assert.deepEqual(res._json.gdTrend, []);

    assert.deepEqual(res._json.summaryStats.totalSessions, {
      interview: 0,
      aptitude: 0,
      gd: 0,
      total: 0,
    });
    assert.deepEqual(res._json.summaryStats.averageScore, {
      interview: 0,
      aptitude: 0,
      gd: 0,
    });
    assert.deepEqual(res._json.summaryStats.bestScore, {
      interview: 0,
      aptitude: 0,
      gd: 0,
    });
    assert.deepEqual(res._json.summaryStats.improvementPercentage, {
      interview: null,
      aptitude: null,
      gd: null,
      overall: null,
    });
  });

  it("should enforce null improvement when user has fewer than 4 attempts in a module", async () => {
    const mockInterviews = [
      { finalScore: 6.0, createdAt: new Date("2026-03-01T10:00:00Z") },
      { finalScore: 7.0, createdAt: new Date("2026-03-02T10:00:00Z") },
      { finalScore: 8.0, createdAt: new Date("2026-03-03T10:00:00Z") },
    ];

    mock.method(Interview, "find", () => createMockQuery(mockInterviews));
    mock.method(AptitudeAttempt, "find", () => createMockQuery([]));
    mock.method(GDSession, "find", () => createMockQuery([]));

    const { req, res } = createMockReqRes({ userId: testUserId });
    await getProgressAnalytics(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res._json.interviewTrend.length, 3);
    assert.equal(res._json.summaryStats.totalSessions.interview, 3);
    assert.equal(res._json.summaryStats.averageScore.interview, 7.0);
    assert.equal(res._json.summaryStats.bestScore.interview, 8.0);
    assert.equal(res._json.summaryStats.improvementPercentage.interview, null);
    assert.equal(res._json.summaryStats.improvementPercentage.overall, null);
  });

  it("should accurately calculate improvement percentage when user has 4+ attempts", async () => {
    // 6 interview rounds: first 3 avg = 6.0, last 3 avg = 8.0 -> +33.3%
    const mockInterviews = [
      { finalScore: 6.0, createdAt: new Date("2026-03-01T10:00:00Z") },
      { finalScore: 6.0, createdAt: new Date("2026-03-02T10:00:00Z") },
      { finalScore: 6.0, createdAt: new Date("2026-03-03T10:00:00Z") },
      { finalScore: 8.0, createdAt: new Date("2026-03-04T10:00:00Z") },
      { finalScore: 8.0, createdAt: new Date("2026-03-05T10:00:00Z") },
      { finalScore: 8.0, createdAt: new Date("2026-03-06T10:00:00Z") },
    ];

    // 4 aptitude attempts: first 3 avg = 70.0, last 3 avg = 85.0 -> +21.4%
    const mockAptitude = [
      { category: "quantitative", topic: "numbers", accuracy: 70.0, createdAt: new Date("2026-03-01T11:00:00Z") },
      { category: "quantitative", topic: "numbers", accuracy: 70.0, createdAt: new Date("2026-03-02T11:00:00Z") },
      { category: "quantitative", topic: "numbers", accuracy: 70.0, createdAt: new Date("2026-03-03T11:00:00Z") },
      { category: "quantitative", topic: "numbers", accuracy: 85.0, createdAt: new Date("2026-03-04T11:00:00Z") },
    ];

    // 4 GD sessions: first 3 avg = 60.0, last 3 avg = 90.0 -> +50.0%
    const mockGD = [
      { evaluation: { overallScore: 60 }, createdAt: new Date("2026-03-01T12:00:00Z") },
      { evaluation: { overallScore: 60 }, createdAt: new Date("2026-03-02T12:00:00Z") },
      { evaluation: { overallScore: 60 }, createdAt: new Date("2026-03-03T12:00:00Z") },
      { evaluation: { overallScore: 90 }, createdAt: new Date("2026-03-04T12:00:00Z") },
    ];

    mock.method(Interview, "find", () => createMockQuery(mockInterviews));
    mock.method(AptitudeAttempt, "find", () => createMockQuery(mockAptitude));
    mock.method(GDSession, "find", () => createMockQuery(mockGD));

    const { req, res } = createMockReqRes({ userId: testUserId });
    await getProgressAnalytics(req, res);

    assert.equal(res.statusCode, 200);

    // Interview stats
    assert.equal(res._json.summaryStats.totalSessions.interview, 6);
    assert.equal(res._json.summaryStats.averageScore.interview, 7.0);
    assert.equal(res._json.summaryStats.bestScore.interview, 8.0);
    assert.equal(res._json.summaryStats.improvementPercentage.interview, 33.3);

    // Aptitude stats (first 3: [70, 70, 70] avg=70; last 3: [70, 70, 85] avg=75 -> (75 - 70)/70 = 7.1%)
    assert.equal(res._json.summaryStats.totalSessions.aptitude, 4);
    assert.equal(res._json.summaryStats.bestScore.aptitude, 85.0);
    assert.equal(res._json.summaryStats.improvementPercentage.aptitude, 7.1);

    // GD stats (first 3: [60, 60, 60] avg=60; last 3: [60, 60, 90] avg=70 -> (70 - 60)/60 = 16.7%)
    assert.equal(res._json.summaryStats.totalSessions.gd, 4);
    assert.equal(res._json.summaryStats.bestScore.gd, 90.0);
    assert.equal(res._json.summaryStats.improvementPercentage.gd, 16.7);

    // Overall improvement average: (33.3 + 7.1 + 16.7) / 3 = 19.0%
    assert.equal(res._json.summaryStats.improvementPercentage.overall, 19.0);
  });

  it("should isolate data by req.userId", async () => {
    let capturedInterviewFilter = null;
    let capturedAptitudeFilter = null;
    let capturedGDFilter = null;

    mock.method(Interview, "find", (filter) => {
      capturedInterviewFilter = filter;
      return createMockQuery([]);
    });
    mock.method(AptitudeAttempt, "find", (filter) => {
      capturedAptitudeFilter = filter;
      return createMockQuery([]);
    });
    mock.method(GDSession, "find", (filter) => {
      capturedGDFilter = filter;
      return createMockQuery([]);
    });

    const specificUserId = new mongoose.Types.ObjectId().toString();
    const { req, res } = createMockReqRes({ userId: specificUserId });
    await getProgressAnalytics(req, res);

    assert.equal(capturedInterviewFilter.userId, specificUserId);
    assert.equal(capturedAptitudeFilter.userId, specificUserId);
    assert.equal(capturedGDFilter.userId, specificUserId);
  });

  it("should handle database errors gracefully with 500 status", async () => {
    mock.method(Interview, "find", () => {
      throw new Error("Database connection lost");
    });

    const { req, res } = createMockReqRes({ userId: testUserId });
    await getProgressAnalytics(req, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res._json.message, "Database connection lost");
  });
});
