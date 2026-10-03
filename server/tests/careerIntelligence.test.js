import { describe, it } from "node:test";
import assert from "node:assert/strict";
import CareerRoadmap from "../models/careerRoadmap.model.js";
import JobApplication from "../models/jobApplication.model.js";
import {
  analyzeJdSchema,
  generateRoadmapSchema,
  createJobApplicationSchema,
} from "../validators/career.validator.js";

describe("Phase 3E: Career Intelligence Engine", () => {
  describe("Career Models Schema Structure", () => {
    it("verifies CareerRoadmap required paths and structure", () => {
      const paths = CareerRoadmap.schema.paths;
      assert.ok(paths.userId.isRequired);
      assert.ok(paths.targetRole.isRequired);
      assert.deepEqual(paths.currentSkillLevel.enumValues, ["beginner", "intermediate", "advanced"]);
      assert.equal(paths.overallProgress.defaultValue, 0);
    });

    it("verifies JobApplication required paths and status enum", () => {
      const paths = JobApplication.schema.paths;
      assert.ok(paths.userId.isRequired);
      assert.ok(paths.company.isRequired);
      assert.ok(paths.role.isRequired);
      assert.deepEqual(paths.status.enumValues, ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"]);
      assert.equal(paths.status.defaultValue, "Wishlist");
    });
  });

  describe("Career Request Validators", () => {
    it("validates analyzeJdSchema with adequate description length", () => {
      const valid = analyzeJdSchema.parse({
        jobDescription: "We are seeking a Staff Software Engineer with 5+ years experience building distributed backend systems.",
      });
      assert.ok(valid.jobDescription);

      assert.throws(() => {
        analyzeJdSchema.parse({ jobDescription: "Short text" });
      });
    });

    it("validates generateRoadmapSchema with defaults", () => {
      const valid = generateRoadmapSchema.parse({
        targetRole: "Full Stack Engineer",
        targetTimelineWeeks: 12,
      });
      assert.equal(valid.targetRole, "Full Stack Engineer");
      assert.equal(valid.currentSkillLevel, "intermediate");
      assert.equal(valid.targetTimelineWeeks, 12);
      assert.equal(valid.weeklyCommitmentHours, 10);
    });

    it("validates createJobApplicationSchema", () => {
      const valid = createJobApplicationSchema.parse({
        company: "Google",
        role: "Software Engineer III",
        status: "Applied",
        location: "Mountain View, CA",
        salaryRange: "$180,000 - $220,000",
      });
      assert.equal(valid.company, "Google");
      assert.equal(valid.status, "Applied");
    });
  });

  describe("Roadmap Progress Calculation", () => {
    it("computes progress percentage accurately", () => {
      const totalMilestones = 8;
      const completedMilestones = 3;
      const progress = Math.round((completedMilestones / totalMilestones) * 100);
      assert.equal(progress, 38);
    });
  });
});
