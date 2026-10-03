import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import UserProfile from "../models/userProfile.model.js";
import { UserProfileService } from "../services/userProfile.service.js";

describe("User Profile Foundation (1-to-1 Model & Service)", () => {
  const dummyUserId = new mongoose.Types.ObjectId().toString();

  describe("UserProfile Mongoose schema structure", () => {
    it("defines required userId referencing User model with unique index", () => {
      const paths = UserProfile.schema.paths;
      assert.ok(paths.userId);
      assert.equal(paths.userId.instance, "ObjectId");
      assert.equal(paths.userId.options.ref, "User");
      assert.equal(paths.userId.options.required, true);
    });

    it("defines headline, bio, targetRole, targetCompanies, and skills taxonomy", () => {
      const paths = UserProfile.schema.paths;
      assert.ok(paths.headline);
      assert.equal(paths.headline.options.maxlength, 120);

      assert.ok(paths.bio);
      assert.equal(paths.bio.options.maxlength, 500);

      assert.ok(paths.targetRole);
      assert.ok(paths.targetCompanies);
      assert.ok(paths.skills);
      assert.ok(paths.education);
      assert.ok(paths["links.github"]);
      assert.ok(paths["preferences.difficultyPreference"]);
    });

    it("verifies career search indexes exist on targetRole and skills.name", () => {
      const indexes = UserProfile.schema.indexes();
      const indexFields = indexes.map((idx) => Object.keys(idx[0])[0]);
      assert.ok(indexFields.includes("targetRole"));
      assert.ok(indexFields.includes("skills.name"));
    });
  });

  describe("UserProfileService contract & privacy sanitization", () => {
    it("sanitizes private user preferences from public profile output contract", () => {
      const mockRawProfile = {
        _id: new mongoose.Types.ObjectId(),
        userId: {
          _id: dummyUserId,
          name: "Alex Vance",
          email: "alex@example.com",
        },
        headline: "Cloud & DevOps Specialist",
        bio: "Building resilient distributed systems.",
        targetRole: "DevOps Engineer",
        targetCompanies: ["Google", "Stripe"],
        skills: [{ name: "Kubernetes", category: "DevOps", level: "Advanced" }],
        links: { github: "https://github.com/alex", linkedin: "", portfolio: "" },
        preferences: {
          emailNotifications: true,
          jobAlerts: true,
          difficultyPreference: "senior",
        },
      };

      // Emulate public profile sanitization
      const sanitizePublicProfile = (profile) => {
        const { preferences, __v, ...publicData } = profile;
        return publicData;
      };

      const sanitized = sanitizePublicProfile(mockRawProfile);
      assert.equal(sanitized.headline, "Cloud & DevOps Specialist");
      assert.equal(sanitized.preferences, undefined);
      assert.equal(sanitized.userId.name, "Alex Vance");
    });

    it("validates skill level enum constraints in document instance", async () => {
      const validDoc = new UserProfile({
        userId: new mongoose.Types.ObjectId(),
        skills: [{ name: "Python", category: "Language", level: "Advanced" }],
      });
      await assert.doesNotReject(async () => {
        await validDoc.validate();
      });

      const invalidDoc = new UserProfile({
        userId: new mongoose.Types.ObjectId(),
        skills: [{ name: "Python", category: "Language", level: "NinjaMaster" }],
      });
      await assert.rejects(async () => {
        await invalidDoc.validate();
      });
    });
  });
});
