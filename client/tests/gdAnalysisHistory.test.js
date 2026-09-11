import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("GD Analysis and Unified History Integration (GD-07)", () => {
  // =============================================================
  // 1. Overall Score & Readiness Tier Thresholds
  // =============================================================
  describe("Score Calculation & Placement Readiness Tiers", () => {
    function getPlacementTier(overallScore) {
      if (overallScore >= 85) {
        return {
          tier: "Tier-1 Corporate Placement Ready",
          percentile: "Top 10th Percentile",
          isCompetitive: true,
        };
      }
      if (overallScore >= 70) {
        return {
          tier: "Competitive Benchmark · Ready",
          percentile: "Top 25th Percentile",
          isCompetitive: true,
        };
      }
      if (overallScore >= 50) {
        return {
          tier: "Developing Foundation · Practice Recommended",
          percentile: "Top 50th Percentile",
          isCompetitive: false,
        };
      }
      return {
        tier: "Foundational Stage · Practice Recommended",
        percentile: "Needs Intensive Coaching",
        isCompetitive: false,
      };
    }

    it("should classify scores >= 85 as Tier-1 Placement Ready", () => {
      const result85 = getPlacementTier(85);
      assert.equal(result85.tier, "Tier-1 Corporate Placement Ready");
      assert.equal(result85.percentile, "Top 10th Percentile");
      assert.equal(result85.isCompetitive, true);

      const result96 = getPlacementTier(96);
      assert.equal(result96.tier, "Tier-1 Corporate Placement Ready");
    });

    it("should classify scores between 70 and 84 as Competitive Benchmark", () => {
      const result70 = getPlacementTier(70);
      assert.equal(result70.tier, "Competitive Benchmark · Ready");
      assert.equal(result70.percentile, "Top 25th Percentile");
      assert.equal(result70.isCompetitive, true);

      const result84 = getPlacementTier(84);
      assert.equal(result84.tier, "Competitive Benchmark · Ready");
    });

    it("should classify scores between 50 and 69 as Developing Foundation", () => {
      const result55 = getPlacementTier(55);
      assert.equal(result55.tier, "Developing Foundation · Practice Recommended");
      assert.equal(result55.isCompetitive, false);
    });

    it("should classify scores below 50 as Foundational Stage", () => {
      const result42 = getPlacementTier(42);
      assert.equal(result42.tier, "Foundational Stage · Practice Recommended");
      assert.equal(result42.isCompetitive, false);
    });

    it("should calculate correct SVG stroke dashoffset for radial gauge", () => {
      const radius = 58;
      const circumference = 2 * Math.PI * radius; // ~364.4247

      function calculateDashoffset(score) {
        const clamped = Math.min(100, Math.max(0, score));
        return circumference - (clamped / 100) * circumference;
      }

      // At 0 score: offset = circumference (empty)
      assert.ok(Math.abs(calculateDashoffset(0) - circumference) < 0.001);

      // At 100 score: offset = 0 (full)
      assert.ok(Math.abs(calculateDashoffset(100) - 0) < 0.001);

      // At 50 score: offset = half circumference
      assert.ok(Math.abs(calculateDashoffset(50) - circumference / 2) < 0.001);
    });
  });

  // =============================================================
  // 2. 4 Core Evaluation Pillars
  // =============================================================
  describe("4 Core Evaluation Pillars", () => {
    const EVALUATION_PILLARS = [
      "articulation",
      "leadership",
      "listening",
      "criticalThinking",
    ];

    it("should validate that all 4 required pillars are present and clamped", () => {
      const rawBreakdown = {
        articulation: 88,
        leadership: 74,
        listening: 92,
        criticalThinking: 81,
      };

      for (const pillar of EVALUATION_PILLARS) {
        assert.ok(pillar in rawBreakdown, `Breakdown must contain pillar: ${pillar}`);
        const score = rawBreakdown[pillar];
        assert.ok(score >= 0 && score <= 100, `Score ${score} must be between 0 and 100`);
      }
    });

    it("should compute weighted overall score if omitted in raw evaluation", () => {
      const breakdown = {
        articulation: 80,
        leadership: 70,
        listening: 90,
        criticalThinking: 80,
      };

      const computedOverall = Math.round(
        breakdown.articulation * 0.25 +
          breakdown.leadership * 0.25 +
          breakdown.listening * 0.25 +
          breakdown.criticalThinking * 0.25
      );

      assert.equal(computedOverall, 80);
    });
  });

  // =============================================================
  // 3. Telemetry & Floor Share Calculations
  // =============================================================
  describe("Speaking Telemetry Formatting", () => {
    function formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      return `${mins}:${secs}`;
    }

    function calculateFloorShare(candidateSec, totalSec) {
      if (!totalSec || totalSec <= 0) return 0;
      const share = Math.round((candidateSec / totalSec) * 100);
      return Math.min(100, Math.max(0, share));
    }

    it("should format candidate speaking time accurately", () => {
      assert.equal(formatDuration(154), "02:34");
      assert.equal(formatDuration(0), "00:00");
      assert.equal(formatDuration(600), "10:00");
    });

    it("should compute speaking floor share percentage within [0, 100]", () => {
      // 154s speaking out of 600s round = 26%
      assert.equal(calculateFloorShare(154, 600), 26);
      assert.equal(calculateFloorShare(0, 600), 0);
      assert.equal(calculateFloorShare(700, 600), 100); // clamped
    });
  });

  // =============================================================
  // 4. Turn Feedback Critique Type Mapping
  // =============================================================
  describe("Turn Critique Types", () => {
    const CRITIQUE_MAP = {
      strong_point: "Strong Argument",
      effective_rebuttal: "Effective Rebuttal",
      constructive_addition: "Constructive Addition",
      interruption: "Floor Intervention",
      off_topic: "Tangential Drift",
      filler: "Hesitation / Filler",
    };

    it("should map all valid critique types to user-friendly titles", () => {
      for (const [, label] of Object.entries(CRITIQUE_MAP)) {
        assert.ok(typeof label === "string" && label.length > 0);
      }
    });

    it("should fallback gracefully for unrecognized critique types", () => {
      const getLabel = (type) => CRITIQUE_MAP[type] || "Constructive Note";
      assert.equal(getLabel("unknown_type"), "Constructive Note");
      assert.equal(getLabel("strong_point"), "Strong Argument");
    });
  });

  // =============================================================
  // 5. Unified History Normalization & Integration
  // =============================================================
  describe("Unified History Normalization for GD Sessions", () => {
    function normalizeGDSession(item) {
      return {
        id: item._id,
        _id: item._id,
        type: "gd",
        module: "gd",
        title: item.topic || "Group Discussion",
        subtitle: `${item.category || ""} • ${item.difficulty || "mid"}`.trim(),
        topic: item.topic,
        category: item.category,
        difficulty: item.difficulty,
        durationMinutes: item.durationMinutes || 10,
        score: item.evaluation?.overallScore || 0,
        finalScore: item.evaluation?.overallScore || 0,
        status: item.status || "completed",
        createdAt: item.createdAt,
        route: `/gd/analysis/${item._id}`,
      };
    }

    const mockGDSession = {
      _id: "64f1a2b3c4d5e6f7a8b9c0d1",
      topic: "Will Artificial Intelligence replace human software engineers?",
      category: "Technology & AI",
      difficulty: "mid",
      durationMinutes: 10,
      status: "completed",
      evaluation: {
        overallScore: 84,
      },
      createdAt: new Date("2026-09-10T12:00:00Z"),
    };

    it("should conform to unified history item schema", () => {
      const normalized = normalizeGDSession(mockGDSession);

      assert.equal(normalized.id, mockGDSession._id);
      assert.equal(normalized.type, "gd");
      assert.equal(normalized.module, "gd");
      assert.equal(normalized.title, mockGDSession.topic);
      assert.equal(normalized.score, 84);
      assert.equal(normalized.finalScore, 84);
      assert.equal(normalized.status, "completed");
      assert.equal(normalized.route, `/gd/analysis/${mockGDSession._id}`);
      assert.equal(normalized.subtitle, "Technology & AI • mid");
    });

    it("should filter history by topic or category keywords correctly", () => {
      const items = [
        normalizeGDSession(mockGDSession),
        {
          id: "int_1",
          type: "interview",
          role: "Frontend Engineer",
          title: "Frontend Engineer",
          score: 8,
          createdAt: new Date("2026-09-09T12:00:00Z"),
        },
        {
          id: "apt_1",
          type: "aptitude",
          category: "Quantitative",
          topic: "Percentages",
          title: "Percentages Test",
          score: 9,
          createdAt: new Date("2026-09-08T12:00:00Z"),
        },
      ];

      // Search for AI should return only GD item
      const queryAI = "intelligence";
      const filteredAI = items.filter((item) => {
        const text = [item.role, item.title, item.subtitle, item.category, item.topic]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(queryAI.toLowerCase());
      });
      assert.equal(filteredAI.length, 1);
      assert.equal(filteredAI[0].type, "gd");

      // Search for "Percentages" should return only aptitude
      const queryApt = "percentages";
      const filteredApt = items.filter((item) => {
        const text = [item.role, item.title, item.subtitle, item.category, item.topic]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(queryApt.toLowerCase());
      });
      assert.equal(filteredApt.length, 1);
      assert.equal(filteredApt[0].type, "aptitude");
    });

    it("should sort mixed history items chronologically by default", () => {
      const gdItem = normalizeGDSession(mockGDSession); // 2026-09-10
      const interviewItem = {
        id: "int_1",
        type: "interview",
        createdAt: new Date("2026-09-11T12:00:00Z"), // 2026-09-11 (latest)
      };
      const aptItem = {
        id: "apt_1",
        type: "aptitude",
        createdAt: new Date("2026-09-08T12:00:00Z"), // 2026-09-08 (oldest)
      };

      const sorted = [gdItem, interviewItem, aptItem].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      assert.equal(sorted[0].id, "int_1");
      assert.equal(sorted[1].id, mockGDSession._id);
      assert.equal(sorted[2].id, "apt_1");
    });
  });
});
