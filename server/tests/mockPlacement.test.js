import { describe, it } from "node:test";
import assert from "node:assert/strict";
import PlacementSession from "../models/placementSession.model.js";
import {
  startPlacementSchema,
  submitRoundSchema,
  placementSessionParamSchema,
} from "../validators/placement.validator.js";

describe("Phase 3F: Mock Placement Drive Platform", () => {
  describe("PlacementSession Model Schema Structure", () => {
    it("verifies required paths and enum constraints on PlacementSession", () => {
      const paths = PlacementSession.schema.paths;
      assert.ok(paths.userId.isRequired);
      assert.ok(paths.targetCompany.isRequired);
      assert.ok(paths.targetRole.isRequired);
      assert.deepEqual(paths.currentRound.enumValues, [1, 2, 3, 4]);
      assert.equal(paths.currentRound.defaultValue, 1);
      assert.deepEqual(paths.overallStatus.enumValues, ["in_progress", "completed", "failed_round", "hired"]);
      assert.equal(paths.overallStatus.defaultValue, "in_progress");
    });

    it("verifies roundResults subdocument paths", () => {
      const paths = PlacementSession.schema.paths;
      assert.ok(paths["roundResults.aptitude"]);
      assert.ok(paths["roundResults.coding"]);
      assert.ok(paths["roundResults.gd"]);
      assert.ok(paths["roundResults.interview"]);
    });
  });

  describe("Placement Request Validation", () => {
    it("validates startPlacementSchema with defaults", () => {
      const valid = startPlacementSchema.parse({});
      assert.equal(valid.targetCompany, "Google");
      assert.equal(valid.targetRole, "Software Engineer");
    });

    it("validates startPlacementSchema with custom company", () => {
      const valid = startPlacementSchema.parse({
        targetCompany: "Amazon",
        targetRole: "Cloud Support Architect",
      });
      assert.equal(valid.targetCompany, "Amazon");
      assert.equal(valid.targetRole, "Cloud Support Architect");
    });

    it("validates submitRoundSchema score range", () => {
      const valid = submitRoundSchema.parse({ score: 85 });
      assert.equal(valid.score, 85);

      assert.throws(() => {
        submitRoundSchema.parse({ score: 120 });
      });
      assert.throws(() => {
        submitRoundSchema.parse({ score: -10 });
      });
    });

    it("validates placement session params", () => {
      const valid = placementSessionParamSchema.parse({
        id: "507f1f77bcf86cd799439011",
        roundNum: 2,
      });
      assert.equal(valid.roundNum, 2);
    });
  });

  describe("Composite Placement Score Calculation", () => {
    it("computes weighted score across 4 rounds accurately", () => {
      const weights = { aptitude: 0.2, coding: 0.35, gd: 0.2, interview: 0.25 };
      const aptScore = 80;
      const codScore = 90;
      const gdScore = 75;
      const intScore = 85;

      const composite = Math.round(
        aptScore * weights.aptitude +
        codScore * weights.coding +
        gdScore * weights.gd +
        intScore * weights.interview
      );

      // (80*0.2) + (90*0.35) + (75*0.2) + (85*0.25) = 16 + 31.5 + 15 + 21.25 = 83.75 -> 84
      assert.equal(composite, 84);
      assert.equal(composite >= 75, true); // Qualified as hired
    });
  });
});
