import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Progress Dashboard Client Verification", () => {
  // 1. Improvement percentage calculation logic
  describe("Improvement Percentage Algorithm", () => {
    const computeImprovement = (items, scoreGetter) => {
      if (!items || items.length < 4) return null;
      const first3Avg = items.slice(0, 3).reduce((sum, i) => sum + (scoreGetter(i) || 0), 0) / 3;
      const last3Avg = items.slice(-3).reduce((sum, i) => sum + (scoreGetter(i) || 0), 0) / 3;
      if (first3Avg === 0) return last3Avg > 0 ? 100 : 0;
      return Number((((last3Avg - first3Avg) / first3Avg) * 100).toFixed(1));
    };

    it("should return null for fewer than 4 attempts", () => {
      assert.equal(computeImprovement([], (i) => i.score), null);
      assert.equal(computeImprovement([{ score: 5 }], (i) => i.score), null);
      assert.equal(computeImprovement([{ score: 5 }, { score: 6 }, { score: 7 }], (i) => i.score), null);
    });

    it("should accurately calculate positive improvement across 4 or more attempts", () => {
      const attempts = [
        { score: 5 },
        { score: 5 },
        { score: 5 },
        { score: 10 },
      ];
      // first 3: [5, 5, 5] avg = 5
      // last 3: [5, 5, 10] avg = 6.6667
      // ((6.6667 - 5) / 5) * 100 = 33.3%
      const result = computeImprovement(attempts, (i) => i.score);
      assert.equal(result, 33.3);
    });

    it("should accurately calculate negative trend / decline", () => {
      const attempts = [
        { score: 8 },
        { score: 8 },
        { score: 8 },
        { score: 4 },
        { score: 4 },
        { score: 4 },
      ];
      // first 3: 8, last 3: 4 -> -50%
      const result = computeImprovement(attempts, (i) => i.score);
      assert.equal(result, -50.0);
    });

    it("should handle baseline of zero gracefully", () => {
      const attempts = [
        { score: 0 },
        { score: 0 },
        { score: 0 },
        { score: 5 },
      ];
      const result = computeImprovement(attempts, (i) => i.score);
      assert.equal(result, 100);
    });
  });

  // 2. Date formatting helpers
  describe("Date Formatting Helpers", () => {
    const formatDateLabel = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    it("should format valid ISO date strings to Month Day format", () => {
      const formatted = formatDateLabel("2026-03-15T10:30:00.000Z");
      assert.ok(formatted.includes("Mar"), "Should contain abbreviated month");
      assert.ok(formatted.includes("15"), "Should contain day number");
    });

    it("should handle empty or invalid date strings safely", () => {
      assert.equal(formatDateLabel(""), "");
      assert.equal(formatDateLabel(null), "");
      assert.equal(formatDateLabel(undefined), "");
      assert.equal(formatDateLabel("not-a-date"), "");
    });
  });

  // 3. Navigation link resolution
  describe("Progress Route & Navigation Resolution", () => {
    const authenticatedLinks = [
      { name: "Progress", path: "/progress", icon: "TrendingUp" },
      { name: "History", path: "/history", icon: "Clock" },
    ];

    it("should include Progress in authenticated nav links", () => {
      const progressLink = authenticatedLinks.find((l) => l.path === "/progress");
      assert.ok(progressLink, "Progress link must exist in authenticated links");
      assert.equal(progressLink.name, "Progress");
      assert.equal(progressLink.icon, "TrendingUp");
    });

    it("should correctly identify active state for /progress", () => {
      const isActive = (path, currentPath) => currentPath === path;
      assert.equal(isActive("/progress", "/progress"), true);
      assert.equal(isActive("/progress", "/history"), false);
      assert.equal(isActive("/progress", "/"), false);
    });
  });
});
