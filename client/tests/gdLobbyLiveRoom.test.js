import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("GD Lobby and Live Discussion Room (GD-06)", () => {
  // =============================================================
  // 1. Participant Personas & Chamber Topology
  // =============================================================
  describe("Participant Topology & Personas", () => {
    const PARTICIPANTS = [
      {
        id: "candidate",
        name: "You (Candidate)",
        role: "Primary Candidate",
        type: "human",
      },
      {
        id: "agent_1",
        name: "Agent 1 — Analytical",
        personaName: "Dr. Aris Chen",
        role: "Analytical",
        type: "ai",
      },
      {
        id: "agent_2",
        name: "Agent 2 — Confident",
        personaName: "Priya Sharma",
        role: "Confident",
        type: "ai",
      },
      {
        id: "agent_3",
        name: "Agent 3 — Critical Thinker",
        personaName: "Marcus Vance",
        role: "Critical Thinker",
        type: "ai",
      },
      {
        id: "orchestrator",
        name: "Central Orchestrator",
        role: "System Moderator",
        type: "system",
      },
    ];

    it("should recognize all 5 active session participants", () => {
      assert.equal(PARTICIPANTS.length, 5);
      const participantIds = PARTICIPANTS.map((p) => p.id);
      assert.deepEqual(participantIds, [
        "candidate",
        "agent_1",
        "agent_2",
        "agent_3",
        "orchestrator",
      ]);
    });

    it("should correctly distinguish AI peers, human candidate, and orchestrator", () => {
      const aiPeers = PARTICIPANTS.filter((p) => p.type === "ai");
      assert.equal(aiPeers.length, 3);
      assert.deepEqual(
        aiPeers.map((p) => p.id),
        ["agent_1", "agent_2", "agent_3"]
      );

      const human = PARTICIPANTS.find((p) => p.type === "human");
      assert.equal(human?.id, "candidate");

      const system = PARTICIPANTS.find((p) => p.type === "system");
      assert.equal(system?.id, "orchestrator");
    });
  });

  // =============================================================
  // 2. Timer & Duration Formatting
  // =============================================================
  describe("Timer & Duration Calculation", () => {
    function calculateRemainingTime(durationMinutes, elapsedSeconds) {
      const totalSeconds = (durationMinutes || 10) * 60;
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
      const mins = Math.floor(remainingSeconds / 60)
        .toString()
        .padStart(2, "0");
      const secs = (remainingSeconds % 60).toString().padStart(2, "0");
      return {
        remainingSeconds,
        formattedTime: `${mins}:${secs}`,
        isExpired: remainingSeconds === 0,
      };
    }

    it("should format remaining time correctly for standard 10-minute session", () => {
      const initial = calculateRemainingTime(10, 0);
      assert.equal(initial.formattedTime, "10:00");
      assert.equal(initial.remainingSeconds, 600);
      assert.equal(initial.isExpired, false);

      const midWay = calculateRemainingTime(10, 245);
      // 600 - 245 = 355s => 5m 55s
      assert.equal(midWay.formattedTime, "05:55");
      assert.equal(midWay.remainingSeconds, 355);
      assert.equal(midWay.isExpired, false);
    });

    it("should clamp at 00:00 when elapsed time exceeds duration", () => {
      const overtime = calculateRemainingTime(10, 650);
      assert.equal(overtime.formattedTime, "00:00");
      assert.equal(overtime.remainingSeconds, 0);
      assert.equal(overtime.isExpired, true);
    });
  });

  // =============================================================
  // 3. Floor Share & Speaking Time Metering
  // =============================================================
  describe("Floor Share Metering", () => {
    function calculateFloorShare(candidateSpeakingSec, elapsedSec) {
      if (!elapsedSec || elapsedSec <= 0) return 0;
      const share = Math.round((candidateSpeakingSec / elapsedSec) * 100);
      return Math.min(100, Math.max(0, share));
    }

    it("should return 0% when session just started", () => {
      assert.equal(calculateFloorShare(0, 0), 0);
      assert.equal(calculateFloorShare(0, 10), 0);
    });

    it("should calculate correct percentage when candidate speaks", () => {
      // 30 seconds spoken in 120 seconds elapsed => 25%
      assert.equal(calculateFloorShare(30, 120), 25);

      // 60 seconds spoken in 180 seconds elapsed => 33%
      assert.equal(calculateFloorShare(60, 180), 33);
    });

    it("should clamp to 100% maximum even with minor timer drift", () => {
      assert.equal(calculateFloorShare(105, 100), 100);
    });
  });

  // =============================================================
  // 4. Candidate Turn Input Validation & Interruption Handling
  // =============================================================
  describe("Turn Submission & Audio Interruption", () => {
    function validateTurnSubmission(content) {
      const trimmed = (content || "").trim();
      if (!trimmed) {
        return { valid: false, error: "Content cannot be empty." };
      }
      if (trimmed.length > 5000) {
        return { valid: false, error: "Content exceeds maximum length." };
      }
      return { valid: true, content: trimmed };
    }

    it("should reject empty or whitespace-only turn content", () => {
      assert.equal(validateTurnSubmission("").valid, false);
      assert.equal(validateTurnSubmission("   \n\t  ").valid, false);
      assert.equal(validateTurnSubmission(null).valid, false);
    });

    it("should accept valid argument content", () => {
      const validText =
        "While AI will automate routine coding tasks, strategic system architecture requires deep human context.";
      const res = validateTurnSubmission(validText);
      assert.equal(res.valid, true);
      assert.equal(res.content, validText);
    });

    it("should properly assign a minimum duration floor for short turns", () => {
      const recordedDuration = 1;
      const effectiveDuration = Math.max(3, recordedDuration);
      assert.equal(effectiveDuration, 3);

      const longerDuration = 14;
      assert.equal(Math.max(3, longerDuration), 14);
    });
  });

  // =============================================================
  // 5. Completion & Refund Invariants
  // =============================================================
  describe("Session Completion and Refund Logic", () => {
    function checkRefundEligibility(candidateTurnCount) {
      return candidateTurnCount === 0;
    }

    function checkSessionCompletion({ transcript, maxTurns, isExpired, isDiscussionComplete }) {
      if (isDiscussionComplete) return true;
      if (isExpired) return true;
      const candidateTurns = transcript.filter((t) => t.speakerId === "candidate").length;
      if (candidateTurns >= maxTurns) return true;
      return false;
    }

    it("should refund credits when abandoning with 0 candidate turns", () => {
      assert.equal(checkRefundEligibility(0), true);
    });

    it("should NOT refund credits when abandoning after participating", () => {
      assert.equal(checkRefundEligibility(1), false);
      assert.equal(checkRefundEligibility(4), false);
    });

    it("should trigger completion when isDiscussionComplete flag is set", () => {
      const complete = checkSessionCompletion({
        transcript: [],
        maxTurns: 30,
        isExpired: false,
        isDiscussionComplete: true,
      });
      assert.equal(complete, true);
    });

    it("should trigger completion when time expires or max turns reached", () => {
      const timeExpired = checkSessionCompletion({
        transcript: [],
        maxTurns: 30,
        isExpired: true,
        isDiscussionComplete: false,
      });
      assert.equal(timeExpired, true);

      const turnsReached = checkSessionCompletion({
        transcript: [
          { speakerId: "candidate" },
          { speakerId: "agent_1" },
          { speakerId: "candidate" },
        ],
        maxTurns: 2,
        isExpired: false,
        isDiscussionComplete: false,
      });
      assert.equal(turnsReached, true);
    });
  });

  // =============================================================
  // 6. Live Room Session Access & Aborted Guard
  // =============================================================
  describe("Live Room Session Access & Aborted Status Guards", () => {
    function evaluateRoomSessionGuard(session) {
      if (!session) {
        return { action: "wait_loading", allowRoomUsage: false };
      }

      if (session.status === "aborted") {
        return {
          action: "redirect_overview",
          route: "/gd",
          replace: true,
          toastMessage: "This discussion session has been terminated.",
          allowRoomUsage: false,
        };
      }

      if (session.status === "completed") {
        return {
          action: "redirect_analysis",
          route: `/gd/analysis/${session._id}`,
          replace: true,
          allowRoomUsage: false,
        };
      }

      if (session.status === "setup" || session.status === "lobby") {
        return {
          action: "transition_in_progress",
          allowRoomUsage: true,
        };
      }

      if (session.status === "in_progress") {
        return {
          action: "render_live_chamber",
          allowRoomUsage: true,
        };
      }

      return { action: "unknown", allowRoomUsage: false };
    }

    it("should redirect to /gd and prevent room usage when session is aborted", () => {
      const guard = evaluateRoomSessionGuard({ _id: "sess-aborted", status: "aborted" });
      assert.equal(guard.action, "redirect_overview");
      assert.equal(guard.route, "/gd");
      assert.equal(guard.replace, true);
      assert.equal(guard.allowRoomUsage, false);
      assert.equal(guard.toastMessage, "This discussion session has been terminated.");
    });

    it("should continue working normally for active in_progress sessions", () => {
      const guard = evaluateRoomSessionGuard({ _id: "sess-active", status: "in_progress" });
      assert.equal(guard.action, "render_live_chamber");
      assert.equal(guard.allowRoomUsage, true);
    });

    it("should transition setup/lobby sessions to in_progress and allow room usage", () => {
      const guardSetup = evaluateRoomSessionGuard({ _id: "sess-setup", status: "setup" });
      assert.equal(guardSetup.action, "transition_in_progress");
      assert.equal(guardSetup.allowRoomUsage, true);

      const guardLobby = evaluateRoomSessionGuard({ _id: "sess-lobby", status: "lobby" });
      assert.equal(guardLobby.action, "transition_in_progress");
      assert.equal(guardLobby.allowRoomUsage, true);
    });

    it("should redirect completed sessions to analysis screen", () => {
      const guard = evaluateRoomSessionGuard({ _id: "sess-done", status: "completed" });
      assert.equal(guard.action, "redirect_analysis");
      assert.equal(guard.route, "/gd/analysis/sess-done");
      assert.equal(guard.replace, true);
      assert.equal(guard.allowRoomUsage, false);
    });
  });
});
