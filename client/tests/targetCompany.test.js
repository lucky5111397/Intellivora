import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getCompanyOptions,
  getCompanyProfile,
} from "../src/config/companyProfiles.js";

describe("Client Company Profiles & PDF Attributes", () => {
  describe("Client Company Profiles", () => {
    it("should export valid company options for UI dropdown", () => {
      const options = getCompanyOptions();
      assert.ok(Array.isArray(options));
      assert.ok(options.length >= 8);

      const ids = options.map((o) => o.id);
      assert.ok(ids.includes("amazon"));
      assert.ok(ids.includes("google"));
      assert.ok(ids.includes("microsoft"));
      assert.ok(ids.includes("tcs"));
      assert.ok(ids.includes("infosys"));
      assert.ok(ids.includes("wipro"));
      assert.ok(ids.includes("accenture"));
      assert.ok(ids.includes("startup"));
    });

    it("should provide aptitude recommendation topics for service companies", () => {
      const tcs = getCompanyProfile("tcs");
      assert.ok(tcs.aptitudeStyle.recommendedTopics.length > 0);
      assert.ok(tcs.aptitudeStyle.recommendedTopics.includes("quantitative"));

      const infosys = getCompanyProfile("infosys");
      assert.ok(infosys.aptitudeStyle.recommendedTopics.includes("logical-reasoning"));
    });

    it("should provide product category and recommended difficulty for FAANG companies", () => {
      const amazon = getCompanyProfile("amazon");
      assert.equal(amazon.category, "product");
      assert.equal(amazon.aptitudeStyle.difficultyDefault, "Hard");

      const google = getCompanyProfile("google");
      assert.equal(google.category, "product");
      assert.equal(google.aptitudeStyle.difficultyDefault, "Hard");
    });

    it("should generate custom company profile dynamically for 'other'", () => {
      const profile = getCompanyProfile("other", "Stripe");
      assert.equal(profile.name, "Stripe");
      assert.equal(profile.category, "custom");
      assert.ok(profile.interviewStyle.includes("Stripe"));
    });
  });

  describe("PDF Generator User Details Attributes", () => {
    it("should construct 3 attributes when targetCompany is omitted", () => {
      const role = "Frontend Engineer";
      const experience = "2 Years";
      const mode = "Technical";
      const targetCompany = null;

      const attributes = [
        { label: "Target Role", value: role },
        { label: "Seniority", value: experience },
        { label: "Evaluation Mode", value: mode },
        ...(targetCompany ? [{ label: "Target Company", value: targetCompany }] : []),
      ];

      assert.equal(attributes.length, 3);
      assert.equal(attributes[0].label, "Target Role");
      assert.equal(attributes[1].label, "Seniority");
      assert.equal(attributes[2].label, "Evaluation Mode");
    });

    it("should construct 4 attributes when targetCompany is provided", () => {
      const role = "Frontend Engineer";
      const experience = "2 Years";
      const mode = "Technical";
      const targetCompany = "Amazon";

      const attributes = [
        { label: "Target Role", value: role },
        { label: "Seniority", value: experience },
        { label: "Evaluation Mode", value: mode },
        ...(targetCompany ? [{ label: "Target Company", value: targetCompany }] : []),
      ];

      assert.equal(attributes.length, 4);
      assert.equal(attributes[3].label, "Target Company");
      assert.equal(attributes[3].value, "Amazon");
    });
  });
});
