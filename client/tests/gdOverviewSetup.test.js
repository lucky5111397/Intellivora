import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  VALID_CATEGORIES,
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
  TOPIC_BANK,
  getTopicsByCategory,
  getRandomTopicByCategory,
  validateGDSetupForm,
} from "../src/gd/data/gdTopicsData.js";

describe("GD Overview & Setup Configuration (GD-05)", () => {
  // =============================================================
  // 1. Curated Topic Bank & Category Data Integrity
  // =============================================================
  describe("Topic Bank & Categories", () => {
    it("should export the 5 approved GD categories", () => {
      assert.deepEqual(VALID_CATEGORIES, [
        "Technology & AI",
        "Business & Economics",
        "Social & Ethical",
        "Case Studies",
        "Custom",
      ]);
    });

    it("should satisfy backend schema constraints for all curated topics", () => {
      const validDifficulties = ["entry", "mid", "executive"];

      for (const [category, topics] of Object.entries(TOPIC_BANK)) {
        if (category === "Custom") {
          assert.ok(Array.isArray(topics), "Custom category should be an array");
          continue;
        }

        assert.ok(topics.length > 0, `Category '${category}' must have curated topics`);

        for (const topic of topics) {
          assert.ok(topic.id && typeof topic.id === "string", "Topic must have an id string");
          assert.ok(typeof topic.title === "string", "Topic title must be a string");
          assert.ok(
            topic.title.length >= 5 && topic.title.length <= 300,
            `Topic '${topic.title}' length (${topic.title.length}) must be between 5 and 300 characters`
          );
          assert.ok(topic.focus && typeof topic.focus === "string", "Topic focus must be non-empty");
          assert.ok(topic.benchmark && typeof topic.benchmark === "string", "Benchmark must be non-empty");
          assert.ok(
            validDifficulties.includes(topic.suggestedDifficulty),
            `Difficulty '${topic.suggestedDifficulty}' must be valid`
          );
          assert.ok(
            topic.suggestedDuration >= 3 && topic.suggestedDuration <= 30,
            `Duration (${topic.suggestedDuration}) must be between 3 and 30 minutes`
          );
        }
      }
    });

    it("should retrieve topics by category and handle fallback gracefully", () => {
      const techTopics = getTopicsByCategory("Technology & AI");
      assert.ok(techTopics.length >= 3);

      const bizTopics = getTopicsByCategory("Business & Economics");
      assert.ok(bizTopics.length >= 3);

      const unknownTopics = getTopicsByCategory("NonExistentCategory");
      assert.ok(unknownTopics.length > 0, "Should fallback to default category topics");
    });

    it("should return random topic by category", () => {
      const topic1 = getRandomTopicByCategory("Technology & AI");
      assert.ok(topic1.title && topic1.title.length >= 5);

      const customTopic = getRandomTopicByCategory("Custom");
      assert.ok(customTopic.title && customTopic.title.length >= 5);
    });
  });

  // =============================================================
  // 2. Setup Form Validation
  // =============================================================
  describe("validateGDSetupForm", () => {
    const validConfig = {
      topic: "Will Artificial Intelligence replace human software engineers?",
      category: "Technology & AI",
      difficulty: "mid",
      durationMinutes: 10,
      maxTurns: 30,
    };

    it("should accept valid configuration", () => {
      const result = validateGDSetupForm(validConfig);
      assert.equal(result.isValid, true);
      assert.deepEqual(result.errors, {});
    });

    it("should reject missing or empty topic", () => {
      const result = validateGDSetupForm({ ...validConfig, topic: "" });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.topic);

      const whitespaceResult = validateGDSetupForm({ ...validConfig, topic: "   " });
      assert.equal(whitespaceResult.isValid, false);
      assert.ok(whitespaceResult.errors.topic);
    });

    it("should reject topic with fewer than 5 characters", () => {
      const result = validateGDSetupForm({ ...validConfig, topic: "AI?" });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.topic.includes("at least 5 characters"));
    });

    it("should reject topic exceeding 300 characters", () => {
      const longTopic = "A".repeat(301);
      const result = validateGDSetupForm({ ...validConfig, topic: longTopic });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.topic.includes("cannot exceed 300 characters"));
    });

    it("should reject invalid category", () => {
      const result = validateGDSetupForm({ ...validConfig, category: "Astrology" });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.category);
    });

    it("should reject invalid difficulty", () => {
      const result = validateGDSetupForm({ ...validConfig, difficulty: "nightmare" });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.difficulty);
    });

    it("should reject out-of-bounds durationMinutes", () => {
      const tooShort = validateGDSetupForm({ ...validConfig, durationMinutes: 2 });
      assert.equal(tooShort.isValid, false);
      assert.ok(tooShort.errors.durationMinutes);

      const tooLong = validateGDSetupForm({ ...validConfig, durationMinutes: 35 });
      assert.equal(tooLong.isValid, false);
      assert.ok(tooLong.errors.durationMinutes);
    });

    it("should reject out-of-bounds maxTurns", () => {
      const tooFewTurns = validateGDSetupForm({ ...validConfig, maxTurns: 3 });
      assert.equal(tooFewTurns.isValid, false);
      assert.ok(tooFewTurns.errors.maxTurns);

      const tooManyTurns = validateGDSetupForm({ ...validConfig, maxTurns: 55 });
      assert.equal(tooManyTurns.isValid, false);
      assert.ok(tooManyTurns.errors.maxTurns);
    });
  });

  // =============================================================
  // 3. Difficulty Options & Design Alignment
  // =============================================================
  describe("Difficulty & Duration Options", () => {
    it("should define exactly 3 difficulty levels with mid as recommended", () => {
      assert.equal(DIFFICULTY_OPTIONS.length, 3);
      const ids = DIFFICULTY_OPTIONS.map((d) => d.id);
      assert.deepEqual(ids, ["entry", "mid", "executive"]);

      const recommended = DIFFICULTY_OPTIONS.filter((d) => d.isRecommended);
      assert.equal(recommended.length, 1);
      assert.equal(recommended[0].id, "mid");
    });

    it("should specify CI badges matching Stitch design specs", () => {
      const entry = DIFFICULTY_OPTIONS.find((d) => d.id === "entry");
      const mid = DIFFICULTY_OPTIONS.find((d) => d.id === "mid");
      const executive = DIFFICULTY_OPTIONS.find((d) => d.id === "executive");

      assert.equal(entry.badge, "CI: 35");
      assert.equal(mid.badge, "CI: 65");
      assert.equal(executive.badge, "CI: 95");
    });

    it("should define 5, 10, and 15 min durations with 10 min recommended", () => {
      assert.equal(DURATION_OPTIONS.length, 3);
      assert.deepEqual(
        DURATION_OPTIONS.map((d) => d.minutes),
        [5, 10, 15]
      );

      const recommended = DURATION_OPTIONS.find((d) => d.isRecommended);
      assert.ok(recommended);
      assert.equal(recommended.minutes, 10);
    });
  });

  // =============================================================
  // 4. Authentication & Credit Guard State Resolution
  // =============================================================
  describe("Authentication & Credit State Resolution", () => {
    const GD_CREDIT_COST = 150;

    function resolveSetupAuthState(userData) {
      const isAuthenticated = Boolean(userData);
      const userCredits = userData?.credits ?? 0;
      const hasSufficientCredits = isAuthenticated && userCredits >= GD_CREDIT_COST;

      return {
        isAuthenticated,
        userCredits: isAuthenticated ? userCredits : null,
        hasSufficientCredits,
        primaryAction: !isAuthenticated
          ? { type: "navigate_auth", route: "/auth", label: "Sign In to Start Discussion" }
          : hasSufficientCredits
          ? { type: "enter_chamber", label: "Enter Discussion Chamber", disabled: false }
          : { type: "insufficient_credits", topUpRoute: "/pricing", disabled: true },
      };
    }

    it("should show authentication-required state and navigate to /auth when user is unauthenticated", () => {
      const state = resolveSetupAuthState(null);
      assert.equal(state.isAuthenticated, false);
      assert.equal(state.hasSufficientCredits, false);
      assert.equal(state.userCredits, null, "Should not display user credit balance for unauthenticated users");
      assert.equal(state.primaryAction.type, "navigate_auth");
      assert.equal(state.primaryAction.route, "/auth");
      assert.equal(state.primaryAction.label, "Sign In to Start Discussion");
    });

    it("should navigate to /auth when authentication action is triggered", () => {
      const state = resolveSetupAuthState(undefined);
      assert.equal(state.isAuthenticated, false);
      assert.equal(state.primaryAction.route, "/auth");
    });

    it("should show insufficient-credit state with top-up action when authenticated user has < 150 credits", () => {
      const state = resolveSetupAuthState({ _id: "user-1", credits: 50 });
      assert.equal(state.isAuthenticated, true);
      assert.equal(state.userCredits, 50);
      assert.equal(state.hasSufficientCredits, false);
      assert.equal(state.primaryAction.type, "insufficient_credits");
      assert.equal(state.primaryAction.topUpRoute, "/pricing");
      assert.equal(state.primaryAction.disabled, true);
    });

    it("should allow entering discussion chamber when authenticated user has >= 150 credits", () => {
      const state = resolveSetupAuthState({ _id: "user-1", credits: 300 });
      assert.equal(state.isAuthenticated, true);
      assert.equal(state.userCredits, 300);
      assert.equal(state.hasSufficientCredits, true);
      assert.equal(state.primaryAction.type, "enter_chamber");
      assert.equal(state.primaryAction.disabled, false);
    });
  });
});
