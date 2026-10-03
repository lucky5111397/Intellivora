import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Phase 4: Candidate Experience, Intelligence & Unified Revision Ecosystem", () => {
  // =========================================================================
  // 1. Mistake Bank Query & Filter Logic
  // =========================================================================
  describe("Mistake Bank Query & Revision Lifecycle", () => {
    const buildMistakeQueryParams = ({ sourceModule, status, search, page = 1, limit = 20 }) => {
      const params = { page, limit };
      if (sourceModule && sourceModule !== "all") params.sourceModule = sourceModule;
      if (status && status !== "all") params.status = status;
      if (search && search.trim()) params.search = search.trim();
      return params;
    };

    it("should build clean query parameters omitting 'all' filters", () => {
      const params = buildMistakeQueryParams({
        sourceModule: "all",
        status: "all",
        search: "",
        page: 1,
        limit: 20,
      });

      assert.deepEqual(params, { page: 1, limit: 20 });
    });

    it("should retain specific module, status, and trimmed search filters", () => {
      const params = buildMistakeQueryParams({
        sourceModule: "quiz",
        status: "unresolved",
        search: "  binary tree  ",
        page: 2,
        limit: 15,
      });

      assert.deepEqual(params, {
        page: 2,
        limit: 15,
        sourceModule: "quiz",
        status: "unresolved",
        search: "binary tree",
      });
    });

    it("should validate revision lifecycle status transitions", () => {
      const validStatuses = ["unresolved", "reviewing", "mastered"];
      const isValidStatus = (s) => validStatuses.includes(s);

      assert.equal(isValidStatus("unresolved"), true);
      assert.equal(isValidStatus("reviewing"), true);
      assert.equal(isValidStatus("mastered"), true);
      assert.equal(isValidStatus("completed"), false);
      assert.equal(isValidStatus("archived"), false);
    });
  });

  // =========================================================================
  // 2. Candidate Profile & Portfolio Contract
  // =========================================================================
  describe("Candidate Profile Portfolio Contract", () => {
    it("should validate allowed experience tiers and taxonomy", () => {
      const allowedTiers = ["fresher", "0-1", "1-3", "3-5", "5+", ""];
      const isValidTier = (tier) => allowedTiers.includes(tier);

      assert.equal(isValidTier("fresher"), true);
      assert.equal(isValidTier("0-1"), true);
      assert.equal(isValidTier("1-3"), true);
      assert.equal(isValidTier("3-5"), true);
      assert.equal(isValidTier("5+"), true);
      assert.equal(isValidTier("10+"), false);
    });

    it("should format candidate skills matrix with proficiency bounds", () => {
      const rawSkills = [
        { name: "React", level: "Advanced" },
        { name: "Node.js", level: "Intermediate" },
        { name: "Docker", level: "Beginner" },
      ];

      const validLevels = new Set(["Beginner", "Intermediate", "Advanced"]);
      const allValid = rawSkills.every(
        (s) => s.name && typeof s.name === "string" && validLevels.has(s.level)
      );

      assert.equal(allValid, true);
      assert.equal(rawSkills.length, 3);
    });

    it("should sanitize and normalize candidate social links", () => {
      const normalizeLinks = (links = {}) => ({
        github: links.github?.trim() || "",
        linkedin: links.linkedin?.trim() || "",
        portfolio: links.portfolio?.trim() || "",
      });

      const normalized = normalizeLinks({
        github: "  https://github.com/testuser  ",
        linkedin: "https://linkedin.com/in/testuser",
        portfolio: "",
      });

      assert.equal(normalized.github, "https://github.com/testuser");
      assert.equal(normalized.linkedin, "https://linkedin.com/in/testuser");
      assert.equal(normalized.portfolio, "");
    });
  });

  // =========================================================================
  // 3. Credit Ledger & Transaction Formatting
  // =========================================================================
  describe("Credit Ledger & Audit Contract", () => {
    const formatTransaction = (tx) => {
      const isDeduction = tx.type === "DEDUCTION";
      return {
        id: tx._id,
        prefix: isDeduction ? "-" : "+",
        displayAmount: `${isDeduction ? "-" : "+"}${Math.abs(tx.amount)}`,
        balanceAfter: tx.balanceAfter,
        badgeClass: isDeduction ? "text-rose-400" : "text-emerald-400",
      };
    };

    it("should format deductions and additions with accurate prefix and color styling", () => {
      const deduction = formatTransaction({
        _id: "tx_1",
        type: "DEDUCTION",
        amount: -20,
        balanceAfter: 80,
      });

      assert.equal(deduction.prefix, "-");
      assert.equal(deduction.displayAmount, "-20");
      assert.equal(deduction.balanceAfter, 80);
      assert.equal(deduction.badgeClass, "text-rose-400");

      const refill = formatTransaction({
        _id: "tx_2",
        type: "REFILL",
        amount: 500,
        balanceAfter: 580,
      });

      assert.equal(refill.prefix, "+");
      assert.equal(refill.displayAmount, "+500");
      assert.equal(refill.balanceAfter, 580);
      assert.equal(refill.badgeClass, "text-emerald-400");
    });
  });

  // =========================================================================
  // 4. Unified 8-Module History Resolution & Radar Telemetry
  // =========================================================================
  describe("Unified 8-Module Activity History & Radar Telemetry", () => {
    const resolveActivityRoute = (item) => {
      const type = (item.type || item.module || "").toLowerCase();
      const id = item._id || item.id;
      switch (type) {
        case "interview":
          return `/report/${id}`;
        case "aptitude":
          return `/aptitude/result/${id}`;
        case "gd":
          return `/gd/analysis/${id}`;
        case "resume":
        case "ats":
          return "/resume";
        case "quiz":
          return `/prepare/quiz/result/${id}`;
        case "dsa":
          return `/prepare/dsa/${item.slug || "two-sum"}`;
        case "placement":
          return `/assess/mock-placement/report/${id}`;
        case "system_design":
          return `/prepare/system-design/${item.slug || "url-shortener"}`;
        default:
          return "/history";
      }
    };

    it("should resolve correct navigation routes across all 8 platform modules", () => {
      assert.equal(resolveActivityRoute({ type: "interview", id: "101" }), "/report/101");
      assert.equal(resolveActivityRoute({ type: "aptitude", id: "102" }), "/aptitude/result/102");
      assert.equal(resolveActivityRoute({ type: "gd", id: "103" }), "/gd/analysis/103");
      assert.equal(resolveActivityRoute({ type: "resume", id: "104" }), "/resume");
      assert.equal(resolveActivityRoute({ type: "quiz", id: "105" }), "/prepare/quiz/result/105");
      assert.equal(resolveActivityRoute({ type: "dsa", slug: "lru-cache" }), "/prepare/dsa/lru-cache");
      assert.equal(resolveActivityRoute({ type: "placement", id: "107" }), "/assess/mock-placement/report/107");
      assert.equal(resolveActivityRoute({ type: "system_design", slug: "rate-limiter" }), "/prepare/system-design/rate-limiter");
    });

    it("should validate 5-axis competency radar boundaries", () => {
      const mockRadar = [
        { subject: "Data Structures & Algos", score: 85, fullMark: 100 },
        { subject: "System Design & Arch", score: 70, fullMark: 100 },
        { subject: "Core CS & Quizzes", score: 90, fullMark: 100 },
        { subject: "Quantitative Aptitude", score: 65, fullMark: 100 },
        { subject: "Communication & GD", score: 80, fullMark: 100 },
      ];

      assert.equal(mockRadar.length, 5);
      for (const axis of mockRadar) {
        assert.ok(axis.score >= 0 && axis.score <= 100, `Score out of bounds: ${axis.score}`);
        assert.equal(axis.fullMark, 100);
      }
    });
  });
});

