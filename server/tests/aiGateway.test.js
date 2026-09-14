import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  generateText,
  generateStructured,
  circuitBreaker,
  categorizeError,
  setCustomAdapter,
  resetCustomAdapter,
} from "../services/aiGateway.service.js";
import { validateAnalysisResponse } from "../services/resumeAnalysis.service.js";
import { validateAndNormalizeEvaluation } from "../services/gdEvaluation.service.js";

describe("Centralized AI Gateway Unit Tests", () => {
  beforeEach(() => {
    circuitBreaker.reset();
    resetCustomAdapter();
  });

  afterEach(() => {
    circuitBreaker.reset();
    resetCustomAdapter();
  });

  describe("Error Categorization", () => {
    it("correctly identifies timeout errors", () => {
      const err = new Error("Request timed out after 10000ms");
      err.code = "ETIMEDOUT";
      assert.equal(categorizeError(err), "timeout");

      const abortErr = new Error("The operation was aborted");
      abortErr.name = "AbortError";
      assert.equal(categorizeError(abortErr), "timeout");
    });

    it("correctly identifies 429 rate limit errors", () => {
      const err = new Error("Resource exhausted");
      err.status = 429;
      assert.equal(categorizeError(err), "rate_limit");

      const quotaErr = new Error("Quota exceeded for quota metric");
      assert.equal(categorizeError(quotaErr), "rate_limit");
    });

    it("correctly identifies 404 / 400 unavailable model errors", () => {
      const err = new Error("models/gemini-2.5-flash-lite is not found for API version v1beta");
      err.status = 404;
      assert.equal(categorizeError(err), "unavailable_model");

      const freeErr = new Error("Model is no longer available for free tier");
      assert.equal(categorizeError(freeErr), "unavailable_model");
    });

    it("correctly identifies empty response errors", () => {
      const err = new Error("Model returned empty text.");
      assert.equal(categorizeError(err), "empty_response");
    });

    it("correctly identifies invalid json errors", () => {
      const err = new SyntaxError("Unexpected token < in JSON at position 0");
      assert.equal(categorizeError(err), "invalid_json");
    });

    it("correctly identifies schema errors", () => {
      const err = new Error("Invalid analysis response: missing scores or strengths");
      assert.equal(categorizeError(err), "schema_error");
    });

    it("falls back to provider_error for generic errors", () => {
      const err = new Error("Unknown network blip");
      assert.equal(categorizeError(err), "provider_error");
    });
  });

  describe("Circuit Breaker & Health Tracking", () => {
    it("trips circuit when model fails and skips it on subsequent calls", () => {
      assert.equal(circuitBreaker.isAvailable("test_provider", "test_model"), true);

      circuitBreaker.recordFailure("test_provider", "test_model", "unavailable_model");
      assert.equal(circuitBreaker.isAvailable("test_provider", "test_model"), false);

      circuitBreaker.recordSuccess("test_provider", "test_model");
      assert.equal(circuitBreaker.isAvailable("test_provider", "test_model"), true);
    });

    it("clears tripped state on reset()", () => {
      circuitBreaker.recordFailure("test_provider", "test_model", "rate_limit");
      assert.equal(circuitBreaker.isAvailable("test_provider", "test_model"), false);

      circuitBreaker.reset();
      assert.equal(circuitBreaker.isAvailable("test_provider", "test_model"), true);
    });
  });

  describe("generateText Fallback Chain", () => {
    it("returns response when primary candidate succeeds", async () => {
      const calls = [];
      setCustomAdapter(async ({ provider, model }) => {
        calls.push({ provider, model });
        return "Hello from primary candidate!";
      });

      const res = await generateText({
        task: "gd_turn",
        prompt: "Say hello",
        candidateChain: [
          { provider: "gemini", model: "primary-model" },
          { provider: "openRouter", model: "secondary-model" },
        ],
      });

      assert.equal(res, "Hello from primary candidate!");
      assert.equal(calls.length, 1);
      assert.equal(calls[0].provider, "gemini");
      assert.equal(calls[0].model, "primary-model");
    });

    it("falls back to secondary candidate when primary fails with 404", async () => {
      const calls = [];
      setCustomAdapter(async ({ provider, model }) => {
        calls.push({ provider, model });
        if (model === "dead-model-404") {
          const err = new Error("Model not found");
          err.status = 404;
          throw err;
        }
        return "Response from fallback model!";
      });

      const res = await generateText({
        task: "gd_turn",
        prompt: "Start turn",
        candidateChain: [
          { provider: "gemini", model: "dead-model-404" },
          { provider: "openRouter", model: "working-fallback" },
        ],
      });

      assert.equal(res, "Response from fallback model!");
      assert.equal(calls.length, 2);
      assert.equal(calls[0].model, "dead-model-404");
      assert.equal(calls[1].model, "working-fallback");

      // Verify dead model tripped circuit breaker
      assert.equal(circuitBreaker.isAvailable("gemini", "dead-model-404"), false);
      // Verify fallback model is available
      assert.equal(circuitBreaker.isAvailable("openRouter", "working-fallback"), true);
    });

    it("falls back when primary candidate times out", async () => {
      const calls = [];
      setCustomAdapter(async ({ provider, model }) => {
        calls.push({ provider, model });
        if (model === "slow-model") {
          const err = new Error("Request timed out");
          err.code = "ETIMEDOUT";
          throw err;
        }
        return "Fast response from backup!";
      });

      const res = await generateText({
        task: "gd_opening",
        prompt: "Open discussion",
        candidateChain: [
          { provider: "gemini", model: "slow-model" },
          { provider: "openRouter", model: "fast-model" },
        ],
      });

      assert.equal(res, "Fast response from backup!");
      assert.equal(calls.length, 2);
      assert.equal(circuitBreaker.isAvailable("gemini", "slow-model"), false);
    });

    it("falls back when primary candidate returns empty text", async () => {
      const calls = [];
      setCustomAdapter(async ({ provider, model }) => {
        calls.push({ provider, model });
        if (model === "empty-model") {
          return "   ";
        }
        return "Valid non-empty response";
      });

      const res = await generateText({
        task: "interview",
        prompt: "Ask a question",
        candidateChain: [
          { provider: "gemini", model: "empty-model" },
          { provider: "openRouter", model: "working-model" },
        ],
      });

      assert.equal(res, "Valid non-empty response");
      assert.equal(calls.length, 2);
    });

    it("skips already tripped models in candidate chain", async () => {
      circuitBreaker.recordFailure("gemini", "already-broken", "unavailable_model");

      const calls = [];
      setCustomAdapter(async ({ provider, model }) => {
        calls.push({ provider, model });
        return "Skipped the broken one!";
      });

      const res = await generateText({
        task: "gd_turn",
        prompt: "Next turn",
        candidateChain: [
          { provider: "gemini", model: "already-broken" },
          { provider: "openRouter", model: "healthy-model" },
        ],
      });

      assert.equal(res, "Skipped the broken one!");
      // Ensure already-broken model was never called
      assert.equal(calls.length, 1);
      assert.equal(calls[0].model, "healthy-model");
    });

    it("throws safe 502 error when all candidate models fail", async () => {
      setCustomAdapter(async ({ provider, model }) => {
        const err = new Error(`Failure on ${provider}:${model}`);
        err.status = 500;
        throw err;
      });

      await assert.rejects(
        async () => {
          await generateText({
            task: "gd_turn",
            prompt: "Test all fail",
            candidateChain: [
              { provider: "gemini", model: "fail-1" },
              { provider: "openRouter", model: "fail-2" },
            ],
          });
        },
        (err) => {
          assert.equal(err.status, 502);
          assert.match(err.message, /AI service is temporarily unavailable/i);
          return true;
        }
      );
    });
  });

  describe("generateStructured & Schema Validation", () => {
    it("successfully parses and validates structured JSON response with markdown blocks", async () => {
      const mockScorecard = {
        resumeScore: 82,
        atsScore: 88,
        interviewReadinessScore: 78,
        strengths: ["Strong JavaScript skills", "Well-structured experience"],
        weaknesses: ["Missing cloud deployment metrics"],
        missingSkills: ["Kubernetes", "GraphQL"],
        improvementSuggestions: ["Add quantifiable business outcomes"],
      };

      setCustomAdapter(async () => {
        // Return wrapped in markdown code fence to verify jsonParser robustness
        return "```json\n" + JSON.stringify(mockScorecard) + "\n```";
      });

      const res = await generateStructured({
        task: "ats",
        prompt: "Analyze resume",
        schemaValidator: validateAnalysisResponse,
        candidateChain: [{ provider: "gemini", model: "gemini-eval" }],
      });

      assert.equal(res.resumeScore, 82);
      assert.equal(res.atsScore, 88);
      assert.equal(res.interviewReadinessScore, 78);
      assert.deepEqual(res.strengths, mockScorecard.strengths);
    });

    it("falls back to next model when first model returns invalid JSON syntax", async () => {
      const calls = [];
      setCustomAdapter(async ({ model }) => {
        calls.push(model);
        if (model === "bad-json-model") {
          return "{ invalid json syntax: missing quotes and truncated ...";
        }
        return JSON.stringify({
          resumeScore: 75,
          atsScore: 70,
          interviewReadinessScore: 80,
          strengths: ["Quick learner"],
          weaknesses: ["Needs more details"],
          missingSkills: ["Docker"],
          improvementSuggestions: ["Include certifications"],
        });
      });

      const res = await generateStructured({
        task: "ats",
        prompt: "Analyze resume",
        schemaValidator: validateAnalysisResponse,
        candidateChain: [
          { provider: "gemini", model: "bad-json-model" },
          { provider: "openRouter", model: "good-json-model" },
        ],
      });

      assert.equal(res.resumeScore, 75);
      assert.equal(calls.length, 2);
      assert.equal(calls[0], "bad-json-model");
      assert.equal(calls[1], "good-json-model");
      assert.equal(circuitBreaker.isAvailable("gemini", "bad-json-model"), false);
    });

    it("falls back to next model when first model output fails schema validation", async () => {
      const calls = [];
      setCustomAdapter(async ({ model }) => {
        calls.push(model);
        if (model === "invalid-schema-model") {
          // Missing required numeric fields and required keys - throws in validateAnalysisResponse
          return JSON.stringify({ randomField: "not a scorecard" });
        }
        return JSON.stringify({
          resumeScore: 85,
          atsScore: 90,
          interviewReadinessScore: 80,
          strengths: ["Clear code"],
          weaknesses: ["No unit tests"],
          missingSkills: ["Docker"],
          improvementSuggestions: ["Add tests"],
        });
      });

      const res = await generateStructured({
        task: "ats",
        prompt: "Analyze resume",
        schemaValidator: validateAnalysisResponse,
        candidateChain: [
          { provider: "gemini", model: "invalid-schema-model" },
          { provider: "openRouter", model: "valid-schema-model" },
        ],
      });

      assert.equal(res.resumeScore, 85);
      assert.equal(calls.length, 2);
      assert.equal(calls[0], "invalid-schema-model");
      assert.equal(calls[1], "valid-schema-model");
      assert.equal(circuitBreaker.isAvailable("gemini", "invalid-schema-model"), false);
    });

    it("normalizes and validates GD evaluation payload correctly", async () => {
      setCustomAdapter(async () => {
        return JSON.stringify({
          breakdown: {
            articulation: 85,
            leadership: 75,
            listening: 90,
            criticalThinking: 80,
          },
          strengths: ["Articulate responses"],
          improvements: ["More proactive turn taking"],
          detailedFeedback: "Demonstrated good domain knowledge.",
        });
      });

      const res = await generateStructured({
        task: "gd_evaluation",
        prompt: "Evaluate session",
        schemaValidator: validateAndNormalizeEvaluation,
        candidateChain: [{ provider: "gemini", model: "gemini-eval" }],
      });

      assert.equal(res.breakdown.articulation, 85);
      assert.equal(res.overallScore, Math.round((85 + 75 + 90 + 80) / 4));
      assert.ok(Array.isArray(res.strengths));
      assert.equal(res.strengths[0], "Articulate responses");
    });

    it("throws safe 502 error when all candidate models fail structured generation", async () => {
      setCustomAdapter(async () => {
        return "Not JSON at all";
      });

      await assert.rejects(
        async () => {
          await generateStructured({
            task: "ats",
            prompt: "Analyze resume",
            candidateChain: [
              { provider: "gemini", model: "fail-1" },
              { provider: "openRouter", model: "fail-2" },
            ],
          });
        },
        (err) => {
          assert.equal(err.status, 502);
          assert.match(err.message, /AI analysis service is temporarily unavailable/i);
          return true;
        }
      );
    });
  });
});
