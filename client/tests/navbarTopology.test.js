import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { directNavLinks, navSections } from "../src/config/navConfig.js";

const expectedSections = {
  prepare: ["DSA", "System Design", "Technical Quiz", "SQL Practice", "Coding Practice"],
  assess: ["AI Interview", "Aptitude", "Group Discussion", "Mock Placement", "Interview Replay"],
  career: ["ATS / Resume", "JD Analyzer", "Career Roadmap", "Company Preparation", "Job Tracker"],
};

describe("Canonical navbar topology", () => {
  it("defines only the Prepare, Assess, and Career top-level sections", () => {
    assert.deepEqual(navSections.map((section) => section.key), ["prepare", "assess", "career"]);
    for (const section of navSections) {
      assert.deepEqual(section.items.map((item) => item.name), expectedSections[section.key]);
      assert.ok(section.items.every((item) => item.path && item.disabled === false));
    }
  });

  it("keeps every configured item linked to a registered application path", () => {
    const paths = navSections.flatMap((section) => section.items.map((item) => item.path));
    assert.deepEqual(directNavLinks.map((link) => link.path), ["/pricing"]);
    assert.ok(paths.includes("/prepare/dsa"));
    assert.ok(paths.includes("/assess/placement"));
    assert.ok(paths.includes("/career/job-tracker"));
    assert.ok(paths.every((path) => path.startsWith("/")));
  });

  it("does not retain legacy top-level navigation categories", () => {
    const labels = navSections.map((section) => section.name);
    assert.ok(!labels.includes("Products"));
    assert.ok(!labels.includes("Use Cases"));
    assert.ok(!labels.includes("Resources"));
    assert.ok(!labels.includes("Technical Assessment"));
  });
});
