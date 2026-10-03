import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import MistakeBank from "../models/mistakeBank.model.js";
import {
  createMistakeSchema,
  updateMistakeStatusSchema,
  updateMistakeNotesSchema,
  queryMistakesSchema,
  mistakeIdParamSchema,
} from "../validators/mistakeBank.validator.js";

describe("Phase 4: Mistake Bank & Revision Ecosystem", () => {
  describe("MistakeBank Model Schema Integrity", () => {
    it("verifies required paths and schema structure", () => {
      const paths = MistakeBank.schema.paths;

      assert.ok(paths.userId, "Must have userId path");
      assert.ok(paths.sourceModule, "Must have sourceModule path");
      assert.ok(paths.questionTitle, "Must have questionTitle path");
      assert.ok(paths.revisionStatus, "Must have revisionStatus path");
      assert.ok(paths.attemptCount, "Must have attemptCount path");
      assert.ok(paths.notes, "Must have notes path");
      assert.ok(paths.lastReviewedAt, "Must have lastReviewedAt path");
    });

    it("enforces allowed sourceModule and revisionStatus enums", () => {
      const sourceModuleEnum = MistakeBank.schema.path("sourceModule").enumValues;
      assert.deepEqual(sourceModuleEnum.sort(), [
        "aptitude",
        "dsa",
        "interview",
        "manual",
        "quiz",
        "sql",
        "system_design",
      ].sort());

      const revisionStatusEnum = MistakeBank.schema.path("revisionStatus").enumValues;
      assert.deepEqual(revisionStatusEnum.sort(), ["mastered", "reviewing", "unresolved"].sort());
    });

    it("verifies default values on document instantiation", () => {
      const doc = new MistakeBank({
        userId: new mongoose.Types.ObjectId(),
        sourceModule: "quiz",
        questionTitle: "What is an event loop tick?",
      });

      assert.equal(doc.revisionStatus, "unresolved");
      assert.equal(doc.attemptCount, 1);
      assert.equal(doc.difficulty, "medium");
      assert.equal(doc.category, "General");
      assert.equal(doc.notes, "");
      assert.equal(doc.lastReviewedAt, null);
    });
  });

  describe("MistakeBank Zod Validators", () => {
    it("accepts valid createMistake payload", () => {
      const payload = {
        sourceModule: "dsa",
        questionTitle: "Two Sum II - Input Array Is Sorted",
        questionSlug: "two-sum-ii",
        category: "Two Pointers",
        difficulty: "medium",
        tags: ["Array", "Two Pointers"],
        userAnswer: "Time Limit Exceeded with O(N^2) brute force",
        expectedAnswer: "O(N) with two pointers",
        explanation: "Initialize left=0, right=len-1 and converge based on target sum",
        notes: "Remember sorted array property",
      };

      const parsed = createMistakeSchema.parse(payload);
      assert.equal(parsed.sourceModule, "dsa");
      assert.equal(parsed.questionTitle, payload.questionTitle);
      assert.equal(parsed.difficulty, "medium");
    });

    it("rejects invalid sourceModule in createMistake", () => {
      assert.throws(
        () =>
          createMistakeSchema.parse({
            sourceModule: "unsupported_module",
            questionTitle: "Valid Title Here",
          }),
        /sourceModule/
      );
    });

    it("rejects too short questionTitle in createMistake", () => {
      assert.throws(
        () =>
          createMistakeSchema.parse({
            sourceModule: "quiz",
            questionTitle: "AB",
          }),
        /Question title must be at least 3 characters/
      );
    });

    it("validates updateMistakeStatusSchema with allowed values", () => {
      assert.equal(updateMistakeStatusSchema.parse({ revisionStatus: "mastered" }).revisionStatus, "mastered");
      assert.equal(updateMistakeStatusSchema.parse({ revisionStatus: "reviewing" }).revisionStatus, "reviewing");
      assert.equal(updateMistakeStatusSchema.parse({ revisionStatus: "unresolved" }).revisionStatus, "unresolved");

      assert.throws(
        () => updateMistakeStatusSchema.parse({ revisionStatus: "finished" }),
        /Status must be/
      );
    });

    it("validates updateMistakeNotesSchema bounds", () => {
      assert.equal(updateMistakeNotesSchema.parse({ notes: "Review again before interviews" }).notes, "Review again before interviews");

      const longNotes = "a".repeat(1001);
      assert.throws(
        () => updateMistakeNotesSchema.parse({ notes: longNotes }),
        /Notes cannot exceed 1000 characters/
      );
    });

    it("applies queryMistakesSchema defaults", () => {
      const parsed = queryMistakesSchema.parse({});
      assert.equal(parsed.page, 1);
      assert.equal(parsed.limit, 20);
      assert.equal(parsed.sourceModule, "all");
      assert.equal(parsed.revisionStatus, "all");
      assert.equal(parsed.search, "");
    });

    it("rejects unsupported query filters for mistake bank lookups", () => {
      assert.throws(
        () => queryMistakesSchema.parse({ sourceModule: "not_real_module" }),
        /sourceModule must be one of the supported modules or 'all'/
      );

      assert.throws(
        () => queryMistakesSchema.parse({ revisionStatus: "done" }),
        /revisionStatus must be one of 'all', 'unresolved', 'reviewing', or 'mastered'/
      );
    });

    it("validates mistakeIdParamSchema for valid ObjectId format", () => {
      const validId = new mongoose.Types.ObjectId().toString();
      assert.equal(mistakeIdParamSchema.parse({ id: validId }).id, validId);

      assert.throws(
        () => mistakeIdParamSchema.parse({ id: "invalid-id-123" }),
        /Invalid mistake ID format/
      );
    });
  });
});

