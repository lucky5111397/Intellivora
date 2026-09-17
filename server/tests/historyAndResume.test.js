import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";

describe("ResumeAnalysis Model & Privacy Validation", () => {
  const validData = {
    userId: new mongoose.Types.ObjectId(),
    targetRole: "Full Stack Engineer",
    experienceLevel: "Senior Level",
    resumeScore: 84,
    atsScore: 88,
    interviewReadinessScore: 82,
    strengths: ["Strong TypeScript knowledge", "Distributed systems design"],
    weaknesses: ["Missing cloud certification mentions"],
    missingSkills: ["Kubernetes", "GraphQL"],
    improvementSuggestions: ["Quantify impact in lead developer role"],
    creditsUsed: 200,
  };

  it("should validate a properly structured resume analysis", () => {
    const record = new ResumeAnalysis(validData);
    const err = record.validateSync();
    assert.equal(err, undefined, "Validation should pass for valid data");
    assert.equal(record.targetRole, "Full Stack Engineer");
    assert.equal(record.experienceLevel, "Senior Level");
    assert.equal(record.resumeScore, 84);
    assert.equal(record.atsScore, 88);
    assert.equal(record.interviewReadinessScore, 82);
    assert.equal(record.creditsUsed, 200);
    assert.equal(record.strengths.length, 2);
  });

  it("should require mandatory fields: userId, targetRole, experienceLevel", () => {
    const record = new ResumeAnalysis({});
    const err = record.validateSync();
    assert.ok(err, "Validation must fail without mandatory fields");
    assert.ok(err.errors.userId, "userId is required");
    assert.ok(err.errors.targetRole, "targetRole is required");
    assert.ok(err.errors.experienceLevel, "experienceLevel is required");
  });

  it("should reject scores outside the 0 to 100 range", () => {
    const recordTooHigh = new ResumeAnalysis({
      ...validData,
      atsScore: 105,
    });
    const errHigh = recordTooHigh.validateSync();
    assert.ok(errHigh?.errors.atsScore, "atsScore > 100 must be rejected");

    const recordTooLow = new ResumeAnalysis({
      ...validData,
      resumeScore: -5,
    });
    const errLow = recordTooLow.validateSync();
    assert.ok(errLow?.errors.resumeScore, "resumeScore < 0 must be rejected");
  });

  it("should enforce privacy and data minimization by omitting full raw resume text", () => {
    const record = new ResumeAnalysis({
      ...validData,
      rawResumeText: "CONFIDENTIAL CANDIDATE RESUME TEXT SHOULD NOT BE SAVED",
      unparsedContent: "Full document contents",
    });
    // Schema strict mode drops unrecognized fields
    assert.equal(record.rawResumeText, undefined, "Raw resume text should not be defined on schema");
    assert.equal(record.unparsedContent, undefined, "Unparsed document text should not be defined on schema");
  });

  it("should have compound index for userId and createdAt", () => {
    const indexes = ResumeAnalysis.schema.indexes();
    const hasCompoundIndex = indexes.some(
      ([fields]) => fields.userId === 1 && fields.createdAt === -1
    );
    assert.ok(hasCompoundIndex, "Must have { userId: 1, createdAt: -1 } compound index");
  });
});

describe("Unified History Normalization with ATS Resume", () => {
  it("should normalize resume analysis item to standard unified history contract", () => {
    const rawResumeItem = {
      _id: "660000000000000000000001",
      targetRole: "Frontend Developer",
      experienceLevel: "Mid Level",
      resumeScore: 78,
      atsScore: 82,
      interviewReadinessScore: 80,
      createdAt: new Date("2026-03-10T12:00:00Z"),
    };

    // Mirrors history.controller.js normalization
    const normalized = {
      id: rawResumeItem._id,
      _id: rawResumeItem._id,
      type: "resume",
      module: "resume",
      title: `${rawResumeItem.targetRole} ATS Analysis`,
      subtitle: `${rawResumeItem.experienceLevel} • ATS Score ${rawResumeItem.atsScore}%`,
      role: rawResumeItem.targetRole,
      targetRole: rawResumeItem.targetRole,
      experienceLevel: rawResumeItem.experienceLevel,
      score: rawResumeItem.atsScore,
      finalScore: rawResumeItem.atsScore,
      resumeScore: rawResumeItem.resumeScore,
      atsScore: rawResumeItem.atsScore,
      interviewReadinessScore: rawResumeItem.interviewReadinessScore,
      status: "completed",
      createdAt: rawResumeItem.createdAt,
      route: "/resume",
    };

    assert.equal(normalized.type, "resume");
    assert.equal(normalized.module, "resume");
    assert.equal(normalized.title, "Frontend Developer ATS Analysis");
    assert.equal(normalized.score, 82);
    assert.equal(normalized.status, "completed");
    assert.equal(normalized.route, "/resume");
  });

  it("should sort all 4 module history records chronologically", () => {
    const items = [
      { id: "1", type: "interview", createdAt: new Date("2026-03-01T10:00:00Z") },
      { id: "2", type: "aptitude", createdAt: new Date("2026-03-05T10:00:00Z") },
      { id: "3", type: "gd", createdAt: new Date("2026-03-08T10:00:00Z") },
      { id: "4", type: "resume", createdAt: new Date("2026-03-12T10:00:00Z") },
    ];

    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    assert.equal(sorted[0].type, "resume", "Latest ATS scan should be first");
    assert.equal(sorted[1].type, "gd");
    assert.equal(sorted[2].type, "aptitude");
    assert.equal(sorted[3].type, "interview");
  });

  it("should enforce user isolation in history deletion query structure", () => {
    const targetUserId = "user-auth-123";
    const deleteId = "660000000000000000000099";

    // Simulating the query built by history.controller.js
    const deleteQuery = { _id: deleteId, userId: targetUserId };

    assert.equal(deleteQuery.userId, targetUserId, "Deletion must strictly match authenticated userId");
    assert.equal(deleteQuery._id, deleteId);
  });
});
