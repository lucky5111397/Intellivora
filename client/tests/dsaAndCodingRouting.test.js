import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { navSections } from "../src/config/navConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

describe("DSA vs Coding Practice Routing & Data Integration", () => {
  describe("Navigation Topology & Distinct Routing", () => {
    it("configures separate registered routes for DSA and Coding Practice under prepare", () => {
      const prepareSection = navSections.find((s) => s.key === "prepare");
      assert.ok(prepareSection, "Prepare section must exist in navConfig");

      const dsaItem = prepareSection.items.find((i) => i.name === "DSA");
      const codingItem = prepareSection.items.find((i) => i.name === "Coding Practice");

      assert.ok(dsaItem, "DSA item must exist");
      assert.ok(codingItem, "Coding Practice item must exist");

      // Verify they point to their respective canonical routes
      assert.equal(dsaItem.path, "/prepare/dsa");
      assert.equal(codingItem.path, "/prepare/coding");
      assert.notEqual(dsaItem.path, codingItem.path, "DSA and Coding Practice must have distinct paths");

      assert.equal(dsaItem.disabled, false);
      assert.equal(codingItem.disabled, false);
    });

    it("ensures all items under prepare have non-empty valid root-relative paths", () => {
      const prepareSection = navSections.find((s) => s.key === "prepare");
      for (const item of prepareSection.items) {
        assert.ok(item.path && item.path.startsWith("/prepare/"), `Item ${item.name} must start with /prepare/`);
        assert.equal(item.disabled, false);
      }
    });
  });

  describe("Question Data Extraction & Schema Adaptation", () => {
    const extractQuestions = (apiResponse) => {
      if (!apiResponse?.success) {
        return { items: [], error: apiResponse?.message || "Failed to load problems from server." };
      }
      const items = Array.isArray(apiResponse.data)
        ? apiResponse.data
        : (apiResponse.data?.items || []);
      return { items, error: null };
    };

    it("correctly extracts items when API returns array under data directly", () => {
      const rawApiPayload = {
        success: true,
        data: [
          { slug: "two-sum", title: "Two Sum", difficulty: "easy" },
          { slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "easy" },
        ],
        pagination: { total: 2, page: 1, limit: 20 },
      };

      const { items, error } = extractQuestions(rawApiPayload);
      assert.equal(error, null);
      assert.equal(items.length, 2);
      assert.equal(items[0].slug, "two-sum");
      assert.equal(items[1].slug, "valid-parentheses");
    });

    it("correctly extracts items when API returns nested items object under data", () => {
      const nestedApiPayload = {
        success: true,
        data: {
          items: [
            { slug: "lru-cache", title: "LRU Cache", difficulty: "medium" },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      };

      const { items, error } = extractQuestions(nestedApiPayload);
      assert.equal(error, null);
      assert.equal(items.length, 1);
      assert.equal(items[0].slug, "lru-cache");
    });

    it("preserves explicit error without disguising failure as empty questions", () => {
      const failedApiPayload = {
        success: false,
        message: "Database connection timeout",
      };

      const { items, error } = extractQuestions(failedApiPayload);
      assert.equal(items.length, 0);
      assert.equal(error, "Database connection timeout");
    });
  });

  describe("UI Mode & Content Differentiation", () => {
    const resolveModeConfig = (pathname, modeProp) => {
      const isCoding = modeProp === "coding" || pathname.startsWith("/prepare/coding");
      if (isCoding) {
        return {
          title: "Coding Practice",
          badge: "Hands-on Programming",
          subtitle: "Solve programming challenges and practical algorithmic problems with multi-language execution in Python, JavaScript, C++, or Java.",
        };
      }
      return {
        title: "Data Structures & Algorithms",
        badge: "Algorithmic Mastery",
        subtitle: "Sharpen your algorithmic thinking with curated interview problems from top tech companies. Run test cases in Python, JavaScript, C++, or Java.",
      };
    };

    it("resolves algorithmic presentation for /prepare/dsa", () => {
      const config = resolveModeConfig("/prepare/dsa", "dsa");
      assert.equal(config.title, "Data Structures & Algorithms");
      assert.equal(config.badge, "Algorithmic Mastery");
    });

    it("resolves hands-on programming presentation for /prepare/coding", () => {
      const config = resolveModeConfig("/prepare/coding", "coding");
      assert.equal(config.title, "Coding Practice");
      assert.equal(config.badge, "Hands-on Programming");
    });
  });

  describe("Workspace Origin Navigation Preservation", () => {
    const resolveOriginCatalog = (locationStateFrom, pathname) => {
      return locationStateFrom || (pathname.startsWith("/prepare/coding") ? "/prepare/coding" : "/prepare/dsa");
    };

    it("returns candidate to /prepare/coding when entering problem from coding catalog", () => {
      const returnTarget = resolveOriginCatalog("/prepare/coding", "/prepare/dsa/two-sum");
      assert.equal(returnTarget, "/prepare/coding");
    });

    it("returns candidate to /prepare/dsa when entering problem from dsa catalog", () => {
      const returnTarget = resolveOriginCatalog("/prepare/dsa", "/prepare/dsa/two-sum");
      assert.equal(returnTarget, "/prepare/dsa");
    });

    it("defaults to /prepare/dsa on direct workspace URL entry", () => {
      const returnTarget = resolveOriginCatalog(undefined, "/prepare/dsa/two-sum");
      assert.equal(returnTarget, "/prepare/dsa");
    });
  });

  describe("App Route Registration & Route Independence", () => {
    it("registers separate routes for both catalogs and workspaces in App.jsx", () => {
      const appContent = fs.readFileSync(path.join(srcDir, "App.jsx"), "utf8");
      assert.match(appContent, /<Route\s+path="\/prepare\/dsa"\s+element={<DsaCatalog\s+mode="dsa"\s*\/>}/);
      assert.match(appContent, /<Route\s+path="\/prepare\/coding"\s+element={<DsaCatalog\s+mode="coding"\s*\/>}/);
      assert.match(appContent, /<Route\s+path="\/prepare\/dsa\/:slug"\s+element={<DsaWorkspace\s*\/>}/);
      assert.match(appContent, /<Route\s+path="\/prepare\/coding\/:slug"\s+element={<DsaWorkspace\s*\/>}/);
    });

    it("ensures no redirect converts /prepare/coding back to /prepare/dsa", () => {
      const appContent = fs.readFileSync(path.join(srcDir, "App.jsx"), "utf8");
      const dsaCatalogContent = fs.readFileSync(path.join(srcDir, "pages/prepare/DsaCatalog.jsx"), "utf8");
      const dsaWorkspaceContent = fs.readFileSync(path.join(srcDir, "pages/prepare/DsaWorkspace.jsx"), "utf8");

      assert.ok(!appContent.includes('to="/prepare/dsa" replace'));
      assert.ok(!appContent.includes('redirect("/prepare/dsa")'));
      assert.ok(!dsaCatalogContent.includes('navigate("/prepare/dsa")'));
      assert.ok(!dsaCatalogContent.includes('to="/prepare/dsa" replace'));
      assert.ok(!dsaWorkspaceContent.includes('navigate("/prepare/dsa")'));
    });
  });

  describe("Problem Link Resolution & Origin Preservation", () => {
    const resolveProblemLink = (slug, mode) => {
      const isCoding = mode === "coding";
      return {
        path: isCoding ? `/prepare/coding/${slug}` : `/prepare/dsa/${slug}`,
        state: { from: isCoding ? "/prepare/coding" : "/prepare/dsa" },
      };
    };

    it("resolves DSA problem navigation preserving DSA origin", () => {
      const link = resolveProblemLink("two-sum", "dsa");
      assert.equal(link.path, "/prepare/dsa/two-sum");
      assert.deepEqual(link.state, { from: "/prepare/dsa" });
    });

    it("resolves Coding Practice problem navigation preserving Coding Practice origin", () => {
      const link = resolveProblemLink("two-sum", "coding");
      assert.equal(link.path, "/prepare/coding/two-sum");
      assert.deepEqual(link.state, { from: "/prepare/coding" });
    });
  });
});

