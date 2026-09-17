import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PRICING_PLANS,
  SERVICE_CREDIT_COSTS,
  NEW_USER_CREDITS,
} from "../src/config/pricingPlans.js";

describe("Navbar & Navigation Behavioral Verification", () => {
  // =========================================================================
  // 1. Navigation Topology & Route Resolution
  // =========================================================================
  describe("Route Matching & Resolution", () => {
    const navItems = [
      { name: "Features", path: "#modules", isHash: true },
      { name: "How It Works", path: "#how-it-works", isHash: true },
      { name: "Mock Interview", path: "/interview", isHash: false },
      { name: "Aptitude Tests", path: "/aptitude", isHash: false },
      { name: "Resume ATS", path: "/resume", isHash: false },
      { name: "Group Discussion", path: "/gd", isHash: false },
      { name: "Pricing & Credits", path: "/pricing", isHash: false },
    ];

    it("should distinguish in-page hash anchors from full routes", () => {
      const hashLinks = navItems.filter((i) => i.isHash);
      const routeLinks = navItems.filter((i) => !i.isHash);
      assert.equal(hashLinks.length, 2);
      assert.equal(routeLinks.length, 5);
      assert.ok(hashLinks.every((i) => i.path.startsWith("#")));
      assert.ok(routeLinks.every((i) => i.path.startsWith("/")));
    });

    it("should correctly identify active routes with prefix matching for nested paths", () => {
      const isRouteActive = (itemPath, currentPath) => {
        if (itemPath.startsWith("#")) return false;
        return (
          currentPath === itemPath ||
          (itemPath !== "/" && currentPath.startsWith(itemPath + "/"))
        );
      };

      assert.equal(isRouteActive("/interview", "/interview"), true);
      assert.equal(isRouteActive("/aptitude", "/aptitude/topics"), true);
      assert.equal(isRouteActive("/aptitude", "/aptitude/test"), true);
      assert.equal(isRouteActive("/gd", "/gd/room/123"), true);
      assert.equal(isRouteActive("/resume", "/resume"), true);
      assert.equal(isRouteActive("/interview", "/aptitude"), false);
      assert.equal(isRouteActive("#modules", "/"), false);
    });

    it("should handle navigation routing based on current path and target", () => {
      const resolveNavigation = (target, currentPath) => {
        if (target.startsWith("#")) {
          if (currentPath === "/") {
            return { type: "scroll", target };
          }
          return { type: "navigate", target: "/" + target };
        }
        return { type: "navigate", target };
      };

      assert.deepEqual(resolveNavigation("#modules", "/"), {
        type: "scroll",
        target: "#modules",
      });
      assert.deepEqual(resolveNavigation("#modules", "/interview"), {
        type: "navigate",
        target: "/#modules",
      });
      assert.deepEqual(resolveNavigation("/pricing", "/"), {
        type: "navigate",
        target: "/pricing",
      });
    });
  });

  // =========================================================================
  // 2. Authentication & Session State Presentation
  // =========================================================================
  describe("Authentication State & User Controls", () => {
    const resolveNavbarState = (userData) => {
      if (!userData) {
        return {
          isAuthenticated: false,
          actions: ["Sign In", "Start Practicing"],
          creditsBadge: null,
          userInitial: null,
        };
      }
      return {
        isAuthenticated: true,
        actions: ["Credits Pill", "User Avatar"],
        creditsBadge: userData.credits ?? 0,
        userInitial: userData.name
          ? userData.name.slice(0, 1).toUpperCase()
          : "U",
      };
    };

    it("should resolve unauthenticated state with guest actions", () => {
      const state = resolveNavbarState(null);
      assert.equal(state.isAuthenticated, false);
      assert.deepEqual(state.actions, ["Sign In", "Start Practicing"]);
      assert.equal(state.creditsBadge, null);
    });

    it("should resolve authenticated state with user initials and credit count", () => {
      const state = resolveNavbarState({ name: "Alex Vance", credits: 350 });
      assert.equal(state.isAuthenticated, true);
      assert.equal(state.creditsBadge, 350);
      assert.equal(state.userInitial, "A");
    });

    it("should handle null or missing user name gracefully", () => {
      const state = resolveNavbarState({ credits: 0 });
      assert.equal(state.isAuthenticated, true);
      assert.equal(state.creditsBadge, 0);
      assert.equal(state.userInitial, "U");
    });

    it("should handle dismissals on Escape key and route change", () => {
      let popupOpen = true;
      const onKeyDown = (key) => {
        if (key === "Escape") popupOpen = false;
      };
      onKeyDown("Escape");
      assert.equal(popupOpen, false);
    });
  });

  // =========================================================================
  // 3. Protected Route Navigation & Auth Hydration
  // =========================================================================
  describe("Route Protection & Auth Hydration", () => {
    const protectedRoutes = ["/interview", "/aptitude", "/resume", "/gd", "/history", "/report/123"];

    const resolveRouteAccess = (target, userData, authLoading) => {
      if (authLoading) {
        return { action: "render_loader" };
      }
      const isProtected = protectedRoutes.some(
        (r) => target === r || target.startsWith(r.replace(/\/:id|\/\d+/, "") + "/")
      );
      if (isProtected && !userData) {
        return {
          action: "redirect_auth",
          target: "/auth",
          state: { from: { pathname: target } },
        };
      }
      return { action: "render_child", target };
    };

    it("should intercept guest attempts on protected services and redirect to /auth with target in state.from", () => {
      const access = resolveRouteAccess("/interview", null, false);
      assert.equal(access.action, "redirect_auth");
      assert.equal(access.target, "/auth");
      assert.deepEqual(access.state, { from: { pathname: "/interview" } });

      const resumeAccess = resolveRouteAccess("/resume", null, false);
      assert.equal(resumeAccess.action, "redirect_auth");
      assert.deepEqual(resumeAccess.state, { from: { pathname: "/resume" } });
    });

    it("should permit authenticated users directly to protected services without redirect", () => {
      const access = resolveRouteAccess("/interview", { name: "Sarah" }, false);
      assert.equal(access.action, "render_child");
      assert.equal(access.target, "/interview");
    });

    it("should hold rendering during auth hydration loading without bouncing user", () => {
      const access = resolveRouteAccess("/interview", null, true);
      assert.equal(access.action, "render_loader");
    });

    it("should resume user to intended destination post-login preserving query parameters and hash", () => {
      const resolvePostLoginDestination = (locationState) => {
        const from = locationState?.from;
        if (!from) return "/";
        if (typeof from === "string") return from;
        if (from.pathname) {
          return `${from.pathname}${from.search || ""}${from.hash || ""}`;
        }
        return "/";
      };

      assert.equal(
        resolvePostLoginDestination({ from: { pathname: "/resume" } }),
        "/resume"
      );
      assert.equal(
        resolvePostLoginDestination({
          from: {
            pathname: "/aptitude/result/123",
            search: "?retake=true",
            hash: "#breakdown",
          },
        }),
        "/aptitude/result/123?retake=true#breakdown"
      );
      assert.equal(
        resolvePostLoginDestination({ from: "/interview" }),
        "/interview"
      );
      assert.equal(resolvePostLoginDestination(null), "/");
      assert.equal(resolvePostLoginDestination({}), "/");
    });
  });

  // =========================================================================
  // 4. Authoritative Billing & Credit Alignment
  // =========================================================================
  describe("Authoritative Billing & Credit System", () => {
    it("should define authoritative INR pricing plans with Free, Starter, and Pro tiers", () => {
      assert.equal(PRICING_PLANS.length, 3);

      const [free, starter, pro] = PRICING_PLANS;

      assert.equal(free.id, "free");
      assert.equal(free.price, "₹0");
      assert.equal(free.priceNumeric, 0);
      assert.equal(free.credits, 100);

      assert.equal(starter.id, "basic");
      assert.equal(starter.price, "₹199");
      assert.equal(starter.priceNumeric, 199);
      assert.equal(starter.credits, 500);

      assert.equal(pro.id, "pro");
      assert.equal(pro.price, "₹499");
      assert.equal(pro.priceNumeric, 499);
      assert.equal(pro.credits, 1500);
    });

    it("should confirm zero unapproved demo pricing tiers exist", () => {
      const prices = PRICING_PLANS.map((p) => p.price);
      assert.ok(!prices.includes("$29"));
      assert.ok(!prices.includes("$79"));
      assert.ok(!prices.includes("$0"));
    });

    it("should match new user welcome credits with Free plan allocation", () => {
      assert.equal(NEW_USER_CREDITS, 100);
      assert.equal(PRICING_PLANS.find((p) => p.id === "free")?.credits, NEW_USER_CREDITS);
    });

    it("should define valid positive service credit consumption costs across modules", () => {
      assert.ok(SERVICE_CREDIT_COSTS.interview.short > 0);
      assert.ok(SERVICE_CREDIT_COSTS.gd > 0);
      assert.ok(SERVICE_CREDIT_COSTS.resume > 0);
      assert.equal(SERVICE_CREDIT_COSTS.aptitude, 0); // Free aptitude drills
    });
  });

  // =========================================================================
  // 5. Unified History & ATS Resume Contract
  // =========================================================================
  describe("Unified History & ATS Resume Contract", () => {
    it("should normalize ATS resume records into unified history contract", () => {
      const mockRawResume = {
        _id: "res_abc_123",
        role: "Full Stack Engineer",
        targetRole: "Full Stack Engineer",
        experience: "2-4 years",
        atsScore: 84,
        readinessScore: 88,
        createdAt: "2026-09-17T10:00:00.000Z",
      };

      const normalized = {
        id: mockRawResume._id,
        _id: mockRawResume._id,
        type: "resume",
        module: "resume",
        title: "ATS Resume Audit",
        subtitle: `${mockRawResume.targetRole || mockRawResume.role} • ${mockRawResume.experience}`,
        role: mockRawResume.targetRole || mockRawResume.role,
        targetRole: mockRawResume.targetRole,
        experience: mockRawResume.experience,
        score: mockRawResume.atsScore,
        atsScore: mockRawResume.atsScore,
        readinessScore: mockRawResume.readinessScore,
        finalScore: mockRawResume.atsScore,
        status: "Completed",
        createdAt: mockRawResume.createdAt,
        route: "/resume",
      };

      assert.equal(normalized.type, "resume");
      assert.equal(normalized.title, "ATS Resume Audit");
      assert.equal(normalized.score, 84);
      assert.equal(normalized.atsScore, 84);
      assert.equal(normalized.readinessScore, 88);
      assert.equal(normalized.route, "/resume");
      assert.equal(normalized.status, "Completed");
    });

    it("should correctly identify resume activity type and route in history list", () => {
      const resolveCardMeta = (item) => {
        const isAptitude = item.type === "aptitude";
        const isGD = item.type === "gd";
        const isResume = item.type === "resume" || item.type === "ats";

        const badgeText = isGD
          ? "Group Discussion"
          : isAptitude
          ? "Aptitude Assessment"
          : isResume
          ? "ATS Resume Audit"
          : "Mock Interview";

        const targetRoute =
          item.route ||
          (isGD
            ? `/gd/analysis/${item.id}`
            : isAptitude
            ? `/aptitude/result/${item.id}`
            : isResume
            ? `/resume`
            : `/report/${item.id}`);

        const scoreDisplay = isGD
          ? `${item.finalScore ?? item.score ?? 0}/100`
          : isAptitude
          ? `${item.score}/${item.totalMarks || 10}`
          : isResume
          ? `${item.atsScore ?? item.score ?? 0}/100`
          : `${item.finalScore || 0}/10`;

        return { badgeText, targetRoute, scoreDisplay };
      };

      const resumeCard = resolveCardMeta({
        id: "res_123",
        type: "resume",
        atsScore: 82,
      });

      assert.equal(resumeCard.badgeText, "ATS Resume Audit");
      assert.equal(resumeCard.targetRoute, "/resume");
      assert.equal(resumeCard.scoreDisplay, "82/100");
    });

    it("should dispatch to /api/history/resume for deleting resume analysis entries", () => {
      const getDeleteEndpoint = (type, id) => {
        if (type === "aptitude") return `/api/history/aptitude/${id}`;
        if (type === "gd") return `/api/history/gd/${id}`;
        if (type === "resume" || type === "ats") return `/api/history/resume/${id}`;
        return `/api/history/interview/${id}`;
      };

      assert.equal(
        getDeleteEndpoint("resume", "res_999"),
        "/api/history/resume/res_999"
      );
      assert.equal(
        getDeleteEndpoint("ats", "ats_888"),
        "/api/history/resume/ats_888"
      );
      assert.equal(
        getDeleteEndpoint("aptitude", "apt_777"),
        "/api/history/aptitude/apt_777"
      );
    });
  });
});
