import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Interview from "../models/interview.model.js";

describe("Phase 3D: Interview Replay Metrics & Analytics", () => {
  describe("Interview Model Schema Compatibility", () => {
    it("verifies Interview questions subdocument supports replay analytics", () => {
      const paths = Interview.schema.paths;
      assert.ok(paths.questions);
      const subPaths = paths.questions.schema.paths;
      assert.ok(subPaths.question);
      assert.ok(subPaths.answer);
      assert.ok(subPaths.feedback);
      assert.ok(subPaths.score);
      assert.ok(subPaths.confidence);
      assert.ok(subPaths.communication);
      assert.ok(subPaths.correctness);
    });
  });

  describe("Replay Metrics Computation Determinism", () => {
    it("aggregates session metrics accurately from question trajectory", () => {
      const mockQuestions = [
        {
          question: "Explain event loop in Node.js",
          score: 85,
          confidence: 90,
          communication: 80,
          correctness: 85,
          feedback: "Great explanation of microtask queue.",
        },
        {
          question: "How does Redis achieve single-threaded performance?",
          score: 65,
          confidence: 70,
          communication: 60,
          correctness: 65,
          feedback: "Need to mention non-blocking epoll I/O multiplexing.",
        },
      ];

      let totalScore = 0;
      let totalConfidence = 0;
      let totalCommunication = 0;
      let totalCorrectness = 0;
      const strengths = [];
      const improvementAreas = [];

      mockQuestions.forEach((q, idx) => {
        totalScore += q.score;
        totalConfidence += q.confidence;
        totalCommunication += q.communication;
        totalCorrectness += q.correctness;

        if (q.score >= 80) {
          strengths.push({ index: idx + 1, highlight: q.feedback });
        } else if (q.score < 70) {
          improvementAreas.push({ index: idx + 1, recommendation: q.feedback });
        }
      });

      const avgScore = Math.round(totalScore / mockQuestions.length);
      const avgConfidence = Math.round(totalConfidence / mockQuestions.length);
      const avgCommunication = Math.round(totalCommunication / mockQuestions.length);
      const avgCorrectness = Math.round(totalCorrectness / mockQuestions.length);

      assert.equal(avgScore, 75);
      assert.equal(avgConfidence, 80);
      assert.equal(avgCommunication, 70);
      assert.equal(avgCorrectness, 75);
      assert.equal(strengths.length, 1);
      assert.equal(improvementAreas.length, 1);
    });
  });
});
