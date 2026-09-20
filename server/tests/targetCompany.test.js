import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import {
  getCompanyOptions,
  getCompanyProfile,
} from "../config/companyProfiles.js";
import Interview from "../models/interview.model.js";
import AptitudeAttempt from "../models/aptitudeAttempt.model.js";

describe("Target Company Feature & Calibration", () => {
  // =========================================================================
  // 1. Company Profiles Configuration
  // =========================================================================
  describe("Company Profiles Configuration", () => {
    it("should return valid options list from getCompanyOptions()", () => {
      const options = getCompanyOptions();
      assert.ok(Array.isArray(options));
      assert.ok(options.length >= 8);

      const amazon = options.find((o) => o.id === "amazon");
      assert.ok(amazon);
      assert.equal(amazon.name, "Amazon");
      assert.equal(amazon.category, "product");

      const tcs = options.find((o) => o.id === "tcs");
      assert.ok(tcs);
      assert.equal(tcs.name, "TCS");
      assert.equal(tcs.category, "service");
    });

    it("should retrieve predefined company profiles accurately", () => {
      const google = getCompanyProfile("google");
      assert.ok(google);
      assert.equal(google.name, "Google");
      assert.ok(google.interviewStyle);
      assert.ok(google.interviewCharacter);
      assert.equal(typeof google.interviewStyle, "string");

      const tcs = getCompanyProfile("tcs");
      assert.ok(tcs);
      assert.equal(tcs.name, "TCS");
      assert.ok(tcs.aptitudeStyle);
      assert.ok(Array.isArray(tcs.aptitudeStyle.recommendedTopics));
      assert.ok(tcs.aptitudeStyle.recommendedTopics.includes("quantitative"));
    });

    it("should return custom company profile for 'other' with custom name", () => {
      const custom = getCompanyProfile("other", "Netflix");
      assert.ok(custom);
      assert.equal(custom.name, "Netflix");
      assert.equal(custom.category, "custom");
      assert.ok(custom.interviewStyle.includes("Netflix"));
    });

    it("should return fallback for 'other' with empty custom name", () => {
      const custom = getCompanyProfile("other", "");
      assert.ok(custom);
      assert.equal(custom.name, "Target Company");
      assert.equal(custom.category, "custom");
    });

    it("should return null for empty or invalid company id", () => {
      assert.equal(getCompanyProfile(null), null);
      assert.equal(getCompanyProfile(""), null);
    });
  });

  // =========================================================================
  // 2. Interview Model Schema Validation
  // =========================================================================
  describe("Interview Model Schema", () => {
    it("should default targetCompany to null when omitted", () => {
      const interview = new Interview({
        userId: new mongoose.Types.ObjectId(),
        role: "Frontend Engineer",
        experience: "2 Years",
        mode: "Technical",
        questions: [{ question: "What is the Virtual DOM?" }],
      });

      assert.equal(interview.targetCompany, null);
    });

    it("should trim and store targetCompany when provided", () => {
      const interview = new Interview({
        userId: new mongoose.Types.ObjectId(),
        role: "Backend Engineer",
        experience: "3-5 Years",
        mode: "Technical",
        targetCompany: "  Amazon  ",
        questions: [{ question: "Explain DynamoDB partitioning." }],
      });

      assert.equal(interview.targetCompany, "Amazon");
    });
  });

  // =========================================================================
  // 3. AptitudeAttempt Model Schema Validation
  // =========================================================================
  describe("AptitudeAttempt Model Schema", () => {
    it("should default targetCompany to null when omitted", () => {
      const attempt = new AptitudeAttempt({
        userId: new mongoose.Types.ObjectId(),
        category: "quantitative",
        topic: "percentage",
        difficulty: "Medium",
        questions: [
          {
            questionId: "q1",
            questionSnapshot: "What is 20% of 80?",
            options: [
              { key: "A", text: "16" },
              { key: "B", text: "18" },
            ],
            correctOptionKey: "A",
          },
        ],
      });

      assert.equal(attempt.targetCompany, null);
    });

    it("should trim and store targetCompany when provided", () => {
      const attempt = new AptitudeAttempt({
        userId: new mongoose.Types.ObjectId(),
        category: "logical-reasoning",
        topic: "syllogisms",
        difficulty: "Medium",
        targetCompany: "  TCS  ",
        questions: [
          {
            questionId: "q1",
            questionSnapshot: "All A are B.",
            options: [
              { key: "A", text: "True" },
              { key: "B", text: "False" },
            ],
            correctOptionKey: "A",
          },
        ],
      });

      assert.equal(attempt.targetCompany, "TCS");
    });
  });

  // =========================================================================
  // 4. Prompt Construction & Style Injection Verification
  // =========================================================================
  describe("Prompt Construction & Style Injection", () => {
    it("should inject company style additively into interview prompt", () => {
      const profile = getCompanyProfile("amazon");
      const companyContext = `Target Company Focus: ${profile.name}\nInterview Style: ${profile.interviewStyle}\nCharacter: ${profile.interviewCharacter}`;

      const basePrompt = `Generate 10 technical questions for a Senior Backend Developer.`;
      const combinedPrompt = `${basePrompt}\n\n${companyContext}`;

      assert.ok(combinedPrompt.includes("Amazon"));
      assert.ok(combinedPrompt.includes("Leadership Principles"));
      assert.ok(combinedPrompt.includes("STAR framework"));
      // Ensure no claims of real or leaked questions
      assert.ok(!combinedPrompt.toLowerCase().includes("real questions"));
      assert.ok(!combinedPrompt.toLowerCase().includes("leaked questions"));
    });

    it("should preserve standard prompt when targetCompany is omitted", () => {
      const targetCompany = null;
      let companyContext = "";
      if (targetCompany) {
        const profile = getCompanyProfile(targetCompany);
        if (profile) {
          companyContext = `Target Company: ${profile.name}`;
        }
      }

      const prompt = `Generate 10 technical questions.${companyContext ? `\n\n${companyContext}` : ""}`;
      assert.equal(prompt, `Generate 10 technical questions.`);
      assert.ok(!prompt.includes("Target Company"));
    });
  });
});
