import { describe, it } from "node:test";
import assert from "node:assert/strict";
import SystemDesignAttempt from "../models/systemDesignAttempt.model.js";
import {
  saveDraftSchema,
  evaluateSystemDesignSchema,
  systemDesignSlugParamSchema,
} from "../validators/systemDesign.validator.js";

describe("Phase 3D: System Design Workspace", () => {
  describe("SystemDesignAttempt Model Schema Structure", () => {
    it("verifies required paths and enum constraints on SystemDesignAttempt", () => {
      const paths = SystemDesignAttempt.schema.paths;
      assert.ok(paths.userId.isRequired);
      assert.ok(paths.slug.isRequired);
      assert.ok(paths.title.isRequired);
      assert.deepEqual(paths.status.enumValues, ["draft", "submitted", "evaluated"]);
      assert.equal(paths.status.defaultValue, "draft");
    });

    it("verifies rubricScores subdocument ranges", () => {
      const paths = SystemDesignAttempt.schema.paths;
      assert.ok(paths.rubricScores);
      const subPaths = paths.rubricScores.schema.paths;
      assert.ok(subPaths.architecturalCompleteness);
      assert.ok(subPaths.scalingCorrectness);
      assert.ok(subPaths.dataDesign);
      assert.ok(subPaths.tradeOffAnalysis);
      assert.ok(subPaths.totalScore);
    });

    it("verifies architecturalNotes subdocument fields", () => {
      const paths = SystemDesignAttempt.schema.paths;
      assert.ok(paths.architecturalNotes);
      const subPaths = paths.architecturalNotes.schema.paths;
      assert.ok(subPaths.functionalRequirements);
      assert.ok(subPaths.highLevelArchitecture);
      assert.ok(subPaths.dataStorage);
    });
  });

  describe("System Design Request Validation", () => {
    it("validates draft save payload", () => {
      const valid = saveDraftSchema.parse({
        diagramData: { nodes: [{ id: "lb-1", type: "LoadBalancer" }] },
        architecturalNotes: {
          functionalRequirements: "Handle 50k QPS with rate limiting",
          highLevelArchitecture: "Client -> Cloudflare -> API Gateway -> Redis Lua -> Downstream",
        },
      });
      assert.ok(valid.architecturalNotes.functionalRequirements);
    });

    it("validates evaluate submission payload", () => {
      const valid = evaluateSystemDesignSchema.parse({
        architecturalNotes: {
          functionalRequirements: "Token bucket rate limiting",
          highLevelArchitecture: "Distributed Redis cluster with Sentinel failover",
          dataStorage: "In-memory keys with TTL expiration",
          tradeOffsAndBottlenecks: "Redis memory capacity vs precision trade-off",
        },
      });
      assert.ok(valid.architecturalNotes.highLevelArchitecture);
    });

    it("validates slug parameters correctly", () => {
      const valid = systemDesignSlugParamSchema.parse({ slug: "design-rate-limiter" });
      assert.equal(valid.slug, "design-rate-limiter");

      assert.throws(() => {
        systemDesignSlugParamSchema.parse({ slug: "x" });
      });
    });
  });
});
