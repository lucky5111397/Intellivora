import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import GDSession from "../models/gdSession.model.js";

describe("GDSession Model Validation", () => {
  const validSessionData = {
    userId: new mongoose.Types.ObjectId(),
    idempotencyKey: "test-idempotency-uuid-1234",
    topic: "Should Artificial Intelligence Systems Have Legal Personhood?",
    category: "Technology & AI",
    difficulty: "mid",
    durationMinutes: 10,
    creditsDeducted: 150,
  };

  it("should validate a properly structured session with defaults", async () => {
    const session = new GDSession(validSessionData);
    const err = session.validateSync();
    assert.equal(err, undefined, "Validation should pass for valid data");

    // Check default values
    assert.equal(session.difficulty, "mid");
    assert.equal(session.durationMinutes, 10);
    assert.equal(session.maxTurns, 30);
    assert.equal(session.status, "setup");
    assert.equal(session.refunded, false);
    assert.equal(session.activeSpeakerId, null);
    assert.equal(session.evaluation, null);
    assert.deepEqual(session.transcript, []);

    // Check telemetry defaults
    assert.equal(session.telemetry.candidateSpeakingTimeSeconds, 0);
    assert.equal(session.telemetry.candidateTurnCount, 0);
    assert.equal(session.telemetry.agent1SpeakingTimeSeconds, 0);
    assert.equal(session.telemetry.agent2SpeakingTimeSeconds, 0);
    assert.equal(session.telemetry.agent3SpeakingTimeSeconds, 0);
    assert.equal(session.telemetry.totalSessionDurationSeconds, 0);
    assert.equal(session.telemetry.totalTurnsCount, 0);
    assert.equal(session.telemetry.interruptionsCount, 0);
  });

  it("should require mandatory fields (userId, idempotencyKey, topic, category, creditsDeducted)", () => {
    const session = new GDSession({});
    const err = session.validateSync();
    assert.ok(err, "Validation should fail for empty session");
    assert.ok(err.errors.userId, "userId is required");
    assert.ok(err.errors.idempotencyKey, "idempotencyKey is required");
    assert.ok(err.errors.topic, "topic is required");
    assert.ok(err.errors.category, "category is required");
    assert.ok(err.errors.creditsDeducted, "creditsDeducted is required");
  });

  it("should reject invalid categories", () => {
    const session = new GDSession({
      ...validSessionData,
      category: "InvalidCategoryName",
    });
    const err = session.validateSync();
    assert.ok(err?.errors.category, "Should reject invalid category enum");
  });

  it("should reject invalid difficulty", () => {
    const session = new GDSession({
      ...validSessionData,
      difficulty: "impossible",
    });
    const err = session.validateSync();
    assert.ok(err?.errors.difficulty, "Should reject invalid difficulty enum");
  });

  it("should reject invalid status lifecycle values", () => {
    const session = new GDSession({
      ...validSessionData,
      status: "unknown_status",
    });
    const err = session.validateSync();
    assert.ok(err?.errors.status, "Should reject invalid status enum");
  });

  it("should accept valid status lifecycle transitions", () => {
    const validStatuses = ["setup", "lobby", "in_progress", "completed", "aborted", "failed"];
    for (const status of validStatuses) {
      const session = new GDSession({ ...validSessionData, status });
      const err = session.validateSync();
      assert.equal(err, undefined, `Status '${status}' should be valid`);
    }
  });

  it("should enforce duration bounds (3 to 30 minutes)", () => {
    const tooShort = new GDSession({ ...validSessionData, durationMinutes: 2 });
    assert.ok(tooShort.validateSync()?.errors.durationMinutes, "Duration < 3 should fail");

    const tooLong = new GDSession({ ...validSessionData, durationMinutes: 35 });
    assert.ok(tooLong.validateSync()?.errors.durationMinutes, "Duration > 30 should fail");

    const validDuration = new GDSession({ ...validSessionData, durationMinutes: 15 });
    assert.equal(validDuration.validateSync(), undefined, "Duration 15 should pass");
  });

  it("should validate transcript turns with strict speaker IDs and labels", () => {
    const session = new GDSession({
      ...validSessionData,
      transcript: [
        {
          turnNumber: 1,
          speakerId: "orchestrator",
          speakerLabel: "System",
          personaRole: "system",
          content: "Welcome everyone to today's group discussion.",
          durationSeconds: 5,
        },
        {
          turnNumber: 2,
          speakerId: "agent_1",
          speakerLabel: "Agent 1",
          personaRole: "analytical",
          content: "Looking at empirical adoption figures, AI integration has accelerated.",
          durationSeconds: 12,
        },
        {
          turnNumber: 3,
          speakerId: "candidate",
          speakerLabel: "You",
          personaRole: "candidate",
          content: "I agree with the points on acceleration, but consider ethical frameworks.",
          durationSeconds: 15,
        },
      ],
    });

    const err = session.validateSync();
    assert.equal(err, undefined, "Valid transcript turns should pass validation");
  });

  it("should reject transcript turns with invalid speakerId or fictional names", () => {
    const sessionWithFictionalSpeaker = new GDSession({
      ...validSessionData,
      transcript: [
        {
          turnNumber: 1,
          speakerId: "alex_moderator", // Fictional/invalid speaker ID
          speakerLabel: "Alex",
          content: "Hello",
        },
      ],
    });

    const err = sessionWithFictionalSpeaker.validateSync();
    assert.ok(err, "Should fail validation for fictional speaker");
    assert.ok(err.errors["transcript.0.speakerId"], "speakerId must be in approved enum");
    assert.ok(err.errors["transcript.0.speakerLabel"], "speakerLabel must be in approved enum");
  });

  it("should validate evaluation structure with 0-100 score bounds", () => {
    const session = new GDSession({
      ...validSessionData,
      status: "completed",
      evaluation: {
        overallScore: 84,
        breakdown: {
          articulation: 88,
          leadership: 80,
          listening: 85,
          criticalThinking: 83,
        },
        strengths: ["Clear opening thesis", "Effectively addressed counterpoint"],
        improvements: ["Elaborate on data", "Step in earlier"],
        detailedFeedback: "Strong overall performance.",
        turnFeedback: [
          {
            turnNumber: 3,
            speakerLabel: "You",
            critiqueType: "strong_point",
            comment: "Well-reasoned ethical point.",
          },
        ],
      },
    });

    const err = session.validateSync();
    assert.equal(err, undefined, "Valid evaluation structure should pass");
  });

  it("should reject evaluation scores outside 0-100 range", () => {
    const sessionOverScore = new GDSession({
      ...validSessionData,
      evaluation: {
        overallScore: 105,
      },
    });
    assert.ok(sessionOverScore.validateSync()?.errors["evaluation.overallScore"], "Score > 100 should fail");

    const sessionNegativeScore = new GDSession({
      ...validSessionData,
      evaluation: {
        overallScore: -5,
      },
    });
    assert.ok(sessionNegativeScore.validateSync()?.errors["evaluation.overallScore"], "Score < 0 should fail");
  });

  it("should have correct compound indexes defined on the schema", () => {
    const indexes = GDSession.schema.indexes();

    const hasIdempotencyIndex = indexes.some(
      ([fields, options]) => fields.userId === 1 && fields.idempotencyKey === 1 && options?.unique === true
    );
    assert.ok(hasIdempotencyIndex, "Should have unique compound index on (userId, idempotencyKey)");

    const hasCreatedAtIndex = indexes.some(
      ([fields]) => fields.userId === 1 && fields.createdAt === -1
    );
    assert.ok(hasCreatedAtIndex, "Should have index on (userId, createdAt: -1)");

    const hasStatusIndex = indexes.some(
      ([fields]) => fields.userId === 1 && fields.status === 1
    );
    assert.ok(hasStatusIndex, "Should have index on (userId, status: 1)");
  });
});

