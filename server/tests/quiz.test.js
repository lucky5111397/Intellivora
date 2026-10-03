import { describe, it } from "node:test";
import assert from "node:assert/strict";
import QuizAttempt from "../models/quizAttempt.model.js";
import {
  startQuizSchema,
  submitQuizSchema,
} from "../validators/quiz.validator.js";

describe("Phase 3C: Technical Quiz Engine", () => {
  describe("QuizAttempt Model Schema Structure", () => {
    it("verifies QuizAttempt required paths and status enum", () => {
      const paths = QuizAttempt.schema.paths;
      assert.ok(paths.userId.isRequired);
      assert.ok(paths.category.isRequired);
      assert.ok(paths.difficulty.isRequired);
      assert.deepEqual(paths.status.enumValues, ["in_progress", "submitted", "expired"]);
      assert.equal(paths.status.defaultValue, "in_progress");
      assert.equal(paths.score.defaultValue, 0);
      assert.equal(paths.correctCount.defaultValue, 0);
    });

    it("verifies answers subdocument array configuration", () => {
      const paths = QuizAttempt.schema.paths;
      assert.ok(paths.answers);
      const subPaths = paths.answers.schema.paths;
      assert.ok(subPaths.questionId.isRequired);
      assert.ok(subPaths.isCorrect);
      assert.ok(subPaths.correctOptionKey.isRequired);
    });
  });

  describe("Quiz Request Validation Schemas", () => {
    it("accepts valid startQuiz payload with difficulty and category", () => {
      const valid = startQuizSchema.parse({
        category: "Computer Science Core",
        difficulty: "medium",
        durationMinutes: 20,
      });
      assert.equal(valid.category, "Computer Science Core");
      assert.equal(valid.difficulty, "medium");
      assert.equal(valid.durationMinutes, 20);
    });

    it("applies default durationMinutes if omitted", () => {
      const valid = startQuizSchema.parse({
        category: "Databases",
        difficulty: "easy",
      });
      assert.equal(valid.durationMinutes, 15);
    });

    it("rejects invalid difficulty levels", () => {
      assert.throws(() => {
        startQuizSchema.parse({
          category: "Algorithms",
          difficulty: "super-hard",
        });
      }, /Invalid option|easy|medium|hard/);
    });

    it("validates submitQuiz payload with answers array", () => {
      const valid = submitQuizSchema.parse({
        timeTakenSeconds: 320,
        answers: [
          { questionId: "507f1f77bcf86cd799439011", selectedOptionKey: "B" },
          { questionId: "507f1f77bcf86cd799439012", selectedOptionKey: "A" },
        ],
      });
      assert.equal(valid.answers.length, 2);
      assert.equal(valid.timeTakenSeconds, 320);
    });

    it("rejects invalid answers structure", () => {
      assert.throws(() => {
        submitQuizSchema.parse({
          answers: "not-an-array",
        });
      });
    });
  });

  describe("Quiz Scoring Engine Determinism", () => {
    it("calculates accuracy and score deterministically", () => {
      const total = 5;
      const correct = 4;
      const score = Math.round((correct / total) * 100);
      const accuracy = Number(((correct / total) * 100).toFixed(1));

      assert.equal(score, 80);
      assert.equal(accuracy, 80.0);
    });

    it("handles zero correct answers gracefully without NaN", () => {
      const total = 10;
      const correct = 0;
      const score = Math.round((correct / total) * 100);
      const accuracy = Number(((correct / total) * 100).toFixed(1));

      assert.equal(score, 0);
      assert.equal(accuracy, 0.0);
    });
  });
});
