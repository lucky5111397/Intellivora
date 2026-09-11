import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  AUDIO_PROFILES,
  getAudioProfile,
  matchVoiceForProfile,
} from "../src/gd/audio/audioProfiles.js";
import { extractErrorMessage } from "../src/gd/gdApi.js";
import {
  gdReducer,
  initialGDState,
} from "../src/gd/context/gdState.js";

describe("GD Frontend Foundation & Audio Layer (GD-04)", () => {
  // =============================================================
  // 1. Audio Profiles & Persona Acoustic Tuning
  // =============================================================
  describe("audioProfiles.js", () => {
    it("should define distinct audio profiles for Agent 1, Agent 2, Agent 3, and System", () => {
      const expectedKeys = ["agent_1", "agent_2", "agent_3", "orchestrator"];
      for (const key of expectedKeys) {
        assert.ok(AUDIO_PROFILES[key], `Profile for ${key} must exist`);
        assert.equal(typeof AUDIO_PROFILES[key].rate, "number");
        assert.equal(typeof AUDIO_PROFILES[key].pitch, "number");
        assert.equal(typeof AUDIO_PROFILES[key].volume, "number");
        assert.ok(Array.isArray(AUDIO_PROFILES[key].voiceKeywords));
      }

      // Persona 1: Analytical (measured, slightly deliberate rate < 1.0)
      assert.equal(AUDIO_PROFILES.agent_1.personaRole, "analytical");
      assert.ok(AUDIO_PROFILES.agent_1.rate < 1.0);

      // Persona 2: Confident (energetic, rate > 1.0, pitch > 1.0)
      assert.equal(AUDIO_PROFILES.agent_2.personaRole, "confident");
      assert.ok(AUDIO_PROFILES.agent_2.rate > 1.0);
      assert.ok(AUDIO_PROFILES.agent_2.pitch > 1.0);

      // Persona 3: Critical Thinker (deliberate rate, inquisitive higher pitch)
      assert.equal(AUDIO_PROFILES.agent_3.personaRole, "critical_thinker");
      assert.ok(AUDIO_PROFILES.agent_3.rate <= 0.95);
      assert.ok(AUDIO_PROFILES.agent_3.pitch > 1.10);

      // System / Orchestrator (authoritative baseline)
      assert.equal(AUDIO_PROFILES.orchestrator.personaRole, "system");
      assert.equal(AUDIO_PROFILES.orchestrator.pitch, 1.0);
    });

    it("should return correct profile via getAudioProfile with orchestrator fallback", () => {
      assert.equal(getAudioProfile("agent_1").speakerId, "agent_1");
      assert.equal(getAudioProfile("agent_2").speakerId, "agent_2");
      assert.equal(getAudioProfile("agent_3").speakerId, "agent_3");
      assert.equal(getAudioProfile("orchestrator").speakerId, "orchestrator");
      assert.equal(getAudioProfile("unknown_agent").speakerId, "orchestrator");
    });

    it("should match browser voices using keywords and gender heuristics", () => {
      const mockVoices = [
        { name: "Microsoft David - English (United States)", lang: "en-US" },
        { name: "Microsoft Zira - English (United States)", lang: "en-US" },
        { name: "Google UK English Male", lang: "en-GB" },
      ];

      // Agent 1 keywords include 'david'
      const matchedAgent1 = matchVoiceForProfile(mockVoices, AUDIO_PROFILES.agent_1);
      assert.ok(matchedAgent1.name.toLowerCase().includes("david"));

      // Agent 2 keywords include 'zira'
      const matchedAgent2 = matchVoiceForProfile(mockVoices, AUDIO_PROFILES.agent_2);
      assert.ok(matchedAgent2.name.toLowerCase().includes("zira"));

      // Fallback handles empty or null voice arrays safely
      assert.equal(matchVoiceForProfile([], AUDIO_PROFILES.agent_1), null);
      assert.equal(matchVoiceForProfile(null, AUDIO_PROFILES.agent_1), null);
    });
  });

  // =============================================================
  // 2. API Error Extraction
  // =============================================================
  describe("gdApi.js helpers", () => {
    it("should normalize and extract error messages properly", () => {
      assert.equal(
        extractErrorMessage("Direct string error"),
        "Direct string error"
      );

      assert.equal(
        extractErrorMessage({
          response: { data: { message: "Insufficient credits" } },
        }),
        "Insufficient credits"
      );

      assert.equal(
        extractErrorMessage({
          response: { data: { error: "Session not found" } },
        }),
        "Session not found"
      );

      assert.equal(
        extractErrorMessage({ message: "Network Error" }),
        "Network Error"
      );

      assert.equal(
        extractErrorMessage(null),
        "An unexpected error occurred."
      );
    });
  });

  // =============================================================
  // 3. GD State Machine & Reducer
  // =============================================================
  describe("gdReducer State Management", () => {
    it("should have correct initial state defaults", () => {
      assert.equal(initialGDState.session, null);
      assert.equal(initialGDState.sessionId, null);
      assert.equal(initialGDState.status, "idle");
      assert.equal(initialGDState.category, "Technology & AI");
      assert.equal(initialGDState.difficulty, "mid");
      assert.equal(initialGDState.durationMinutes, 10);
      assert.equal(initialGDState.maxTurns, 30);
      assert.deepEqual(initialGDState.transcript, []);
      assert.equal(initialGDState.telemetry.candidateTurnCount, 0);
      assert.equal(initialGDState.evaluation, null);
      assert.equal(initialGDState.loading, false);
      assert.equal(initialGDState.error, null);
    });

    it("should handle SET_LOADING and SET_ERROR / CLEAR_ERROR", () => {
      let state = gdReducer(initialGDState, { type: "SET_LOADING", payload: true });
      assert.equal(state.loading, true);

      state = gdReducer(state, { type: "SET_ERROR", payload: "Failed to connect" });
      assert.equal(state.error, "Failed to connect");
      assert.equal(state.loading, false);

      state = gdReducer(state, { type: "CLEAR_ERROR" });
      assert.equal(state.error, null);
    });

    it("should handle SET_OVERVIEW", () => {
      const stats = { totalCompleted: 4, averageScore: 82, topDimension: "Critical Thinking" };
      const recentSessions = [{ _id: "sess1", topic: "AI Governance" }];

      const state = gdReducer(initialGDState, {
        type: "SET_OVERVIEW",
        payload: { stats, recentSessions },
      });

      assert.deepEqual(state.stats, stats);
      assert.deepEqual(state.recentSessions, recentSessions);
      assert.equal(state.loading, false);
    });

    it("should handle SET_SESSION and synchronize session metadata", () => {
      const mockSession = {
        _id: "67ce2fa8c1234",
        topic: "Should AI Have Legal Personhood?",
        category: "Technology & AI",
        difficulty: "executive",
        durationMinutes: 15,
        maxTurns: 35,
        status: "in_progress",
        transcript: [
          { turnNumber: 1, speakerId: "orchestrator", content: "Opening statement" },
        ],
        telemetry: {
          candidateSpeakingTimeSeconds: 45,
          candidateTurnCount: 2,
        },
      };

      const state = gdReducer(initialGDState, {
        type: "SET_SESSION",
        payload: mockSession,
      });

      assert.equal(state.sessionId, "67ce2fa8c1234");
      assert.equal(state.topic, "Should AI Have Legal Personhood?");
      assert.equal(state.difficulty, "executive");
      assert.equal(state.durationMinutes, 15);
      assert.equal(state.maxTurns, 35);
      assert.equal(state.status, "in_progress");
      assert.equal(state.transcript.length, 1);
      assert.equal(state.telemetry.candidateTurnCount, 2);
    });

    it("should handle APPEND_TURN and update activeSpeakerId", () => {
      const baseState = {
        ...initialGDState,
        transcript: [{ turnNumber: 1, speakerId: "orchestrator", content: "Opening" }],
        activeSpeakerId: "orchestrator",
      };

      const newTurn = {
        turnNumber: 2,
        speakerId: "candidate",
        speakerLabel: "You",
        content: "I propose we evaluate empirical precedence.",
      };

      const state = gdReducer(baseState, {
        type: "APPEND_TURN",
        payload: newTurn,
      });

      assert.equal(state.transcript.length, 2);
      assert.equal(state.transcript[1].speakerId, "candidate");
      assert.equal(state.activeSpeakerId, "candidate");
    });

    it("should handle FINISH_SUCCESS and record evaluation", () => {
      const baseState = {
        ...initialGDState,
        sessionId: "sess-123",
        status: "in_progress",
        activeSpeakerId: "agent_2",
      };

      const evaluation = {
        overallScore: 88,
        breakdown: { articulation: 90, leadership: 85, listening: 88, criticalThinking: 89 },
      };

      const state = gdReducer(baseState, {
        type: "FINISH_SUCCESS",
        payload: { evaluation },
      });

      assert.equal(state.status, "completed");
      assert.equal(state.activeSpeakerId, null);
      assert.equal(state.isDiscussionComplete, true);
      assert.deepEqual(state.evaluation, evaluation);
    });

    it("should handle ABORT_SUCCESS and record refund status", () => {
      const baseState = {
        ...initialGDState,
        session: { _id: "sess-123", status: "setup" },
        status: "setup",
      };

      const state = gdReducer(baseState, {
        type: "ABORT_SUCCESS",
        payload: { refunded: true },
      });

      assert.equal(state.status, "aborted");
      assert.equal(state.activeSpeakerId, null);
      assert.equal(state.session.status, "aborted");
      assert.equal(state.session.refunded, true);
    });

    it("should handle RESET_SESSION while preserving overview stats", () => {
      const stateWithStats = {
        ...initialGDState,
        sessionId: "sess-123",
        status: "completed",
        transcript: [{ turnNumber: 1 }],
        stats: { totalCompleted: 5 },
        recentSessions: [{ id: 1 }],
      };

      const resetState = gdReducer(stateWithStats, { type: "RESET_SESSION" });

      assert.equal(resetState.sessionId, null);
      assert.equal(resetState.status, "idle");
      assert.deepEqual(resetState.transcript, []);
      assert.deepEqual(resetState.stats, { totalCompleted: 5 });
      assert.deepEqual(resetState.recentSessions, [{ id: 1 }]);
    });
  });
});
