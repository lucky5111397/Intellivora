import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import GDSession from "../models/gdSession.model.js";
import {
  AGENT_PERSONAS,
  ORCHESTRATOR_CONFIG,
  selectNextSpeaker,
  buildAgentPrompt,
  sanitizeDialogue,
  estimateSpokenDurationSeconds,
  isDiscussionComplete,
  generateOpeningTurn,
  generateAgentTurn,
  defaultAICaller,
} from "../services/gdOrchestrator.service.js";
import {
  clampScore,
  extractJsonFromResponse,
  validateAndNormalizeEvaluation,
  buildEvaluationPrompt,
  evaluateGDSession,
} from "../services/gdEvaluation.service.js";

describe("GD Orchestrator & Evaluation Services (GD-02)", () => {
  // -------------------------------------------------------------
  // 1. Participant Personas & Naming Conventions
  // -------------------------------------------------------------
  describe("Participant Personas & Rules", () => {
    it("should strictly define Agent 1, Agent 2, Agent 3 without fictional human names", () => {
      const keys = Object.keys(AGENT_PERSONAS);
      assert.deepEqual(keys.sort(), ["agent_1", "agent_2", "agent_3"]);

      assert.equal(AGENT_PERSONAS.agent_1.speakerLabel, "Agent 1");
      assert.equal(AGENT_PERSONAS.agent_1.personaRole, "analytical");

      assert.equal(AGENT_PERSONAS.agent_2.speakerLabel, "Agent 2");
      assert.equal(AGENT_PERSONAS.agent_2.personaRole, "confident");

      assert.equal(AGENT_PERSONAS.agent_3.speakerLabel, "Agent 3");
      assert.equal(AGENT_PERSONAS.agent_3.personaRole, "critical_thinker");

      // Verify no fictional names in labels or descriptions
      const allLabels = Object.values(AGENT_PERSONAS).map((p) => p.speakerLabel);
      assert.ok(!allLabels.includes("Alex"));
      assert.ok(!allLabels.includes("Dr. Thorne"));
      assert.ok(!allLabels.includes("Elena"));
      assert.ok(!allLabels.includes("Devon"));
    });

    it("should define orchestrator as internal system role", () => {
      assert.equal(ORCHESTRATOR_CONFIG.speakerId, "orchestrator");
      assert.equal(ORCHESTRATOR_CONFIG.speakerLabel, "System");
      assert.equal(ORCHESTRATOR_CONFIG.personaRole, "system");
    });
  });

  // -------------------------------------------------------------
  // 2. Dynamic Turn Selection & Inactivity Handling
  // -------------------------------------------------------------
  describe("Dynamic Turn Selection", () => {
    it("should prioritize candidate if floor is requested and candidate did not just speak", () => {
      const transcript = [
        { turnNumber: 1, speakerId: "orchestrator", speakerLabel: "System" },
        { turnNumber: 2, speakerId: "agent_1", speakerLabel: "Agent 1" },
      ];

      const next = selectNextSpeaker({
        transcript,
        maxTurns: 30,
        floorRequestedByCandidate: true,
      });

      assert.equal(next.speakerId, "candidate");
      assert.equal(next.speakerLabel, "You");
      assert.equal(next.personaRole, "candidate");
      assert.equal(next.isComplete, false);
    });

    it("should not schedule candidate twice consecutively even if floor requested", () => {
      const transcript = [
        { turnNumber: 1, speakerId: "agent_1", speakerLabel: "Agent 1" },
        { turnNumber: 2, speakerId: "candidate", speakerLabel: "You" },
      ];

      const next = selectNextSpeaker({
        transcript,
        maxTurns: 30,
        floorRequestedByCandidate: true,
      });

      // Should choose an AI agent instead of repeating candidate
      assert.notEqual(next.speakerId, "candidate");
      assert.ok(["agent_1", "agent_2", "agent_3"].includes(next.speakerId));
    });

    it("should detect candidate inactivity and set promptCandidate flag after 2+ turns", () => {
      const transcript = [
        { turnNumber: 1, speakerId: "candidate", speakerLabel: "You" },
        { turnNumber: 2, speakerId: "agent_1", speakerLabel: "Agent 1" },
        { turnNumber: 3, speakerId: "agent_2", speakerLabel: "Agent 2" },
      ];

      const next = selectNextSpeaker({ transcript, maxTurns: 30 });
      assert.equal(next.promptCandidate, true, "Should prompt candidate after 2 silent turns");
      assert.equal(next.speakerId, "agent_3", "Should pick agent_3 for balanced turn distribution");
    });

    it("should balance peer turns among eligible agents", () => {
      // agent_1 has 2 turns, agent_2 has 1 turn, agent_3 has 0 turns
      const transcript = [
        { turnNumber: 1, speakerId: "agent_1", speakerLabel: "Agent 1" },
        { turnNumber: 2, speakerId: "candidate", speakerLabel: "You" },
        { turnNumber: 3, speakerId: "agent_2", speakerLabel: "Agent 2" },
        { turnNumber: 4, speakerId: "agent_1", speakerLabel: "Agent 1" },
      ];

      const next = selectNextSpeaker({ transcript, maxTurns: 30 });
      // Agent 1 just spoke, so eligible are agent_2 (1 turn) and agent_3 (0 turns).
      // Agent 3 has lowest count, so should be selected.
      assert.equal(next.speakerId, "agent_3");
      assert.equal(next.speakerLabel, "Agent 3");
    });

    it("should signal completion when maxTurns is reached", () => {
      const transcript = Array.from({ length: 30 }, (_, i) => ({
        turnNumber: i + 1,
        speakerId: i % 2 === 0 ? "agent_1" : "candidate",
      }));

      const next = selectNextSpeaker({ transcript, maxTurns: 30 });
      assert.equal(next.isComplete, true);
      assert.equal(next.speakerId, null);
    });
  });

  // -------------------------------------------------------------
  // 3. Completion & Time Boundary Logic
  // -------------------------------------------------------------
  describe("Completion Boundary Checking", () => {
    it("should return true when transcript length reaches or exceeds maxTurns", () => {
      assert.equal(isDiscussionComplete({ transcript: new Array(30), maxTurns: 30 }), true);
      assert.equal(isDiscussionComplete({ transcript: new Array(32), maxTurns: 30 }), true);
      assert.equal(isDiscussionComplete({ transcript: new Array(15), maxTurns: 30 }), false);
    });

    it("should return true when elapsed time reaches or exceeds duration limit", () => {
      // 10 minutes = 600 seconds
      assert.equal(
        isDiscussionComplete({
          transcript: new Array(10),
          maxTurns: 30,
          durationMinutes: 10,
          elapsedTimeSeconds: 600,
        }),
        true
      );
      assert.equal(
        isDiscussionComplete({
          transcript: new Array(10),
          maxTurns: 30,
          durationMinutes: 10,
          elapsedTimeSeconds: 590,
        }),
        false
      );
    });
  });

  // -------------------------------------------------------------
  // 4. Prompt Construction & Context Pruning
  // -------------------------------------------------------------
  describe("Agent Prompt Construction", () => {
    it("should implement sliding window pruning keeping only the last 6 turns", () => {
      const fullTranscript = Array.from({ length: 12 }, (_, i) => ({
        turnNumber: i + 1,
        speakerId: `speaker_${i + 1}`,
        speakerLabel: `Speaker ${i + 1}`,
        personaRole: "role",
        content: `Content of turn number ${i + 1}`,
      }));

      const messages = buildAgentPrompt({
        topic: "Future of Clean Energy",
        category: "Technology & AI",
        difficulty: "mid",
        agentId: "agent_1",
        transcript: fullTranscript,
      });

      const userPrompt = messages[1].content;
      // Should contain turn 7 to 12
      assert.ok(userPrompt.includes("Speaker 12"));
      assert.ok(userPrompt.includes("Speaker 7"));
      // Should NOT contain turn 1 to 6
      assert.ok(!userPrompt.includes("Speaker 1 ("));
      assert.ok(!userPrompt.includes("Speaker 6 ("));
    });

    it("should inject anti-repetition rules and candidate invitation when prompted", () => {
      const messages = buildAgentPrompt({
        topic: "Universal Basic Income",
        category: "Business & Economics",
        difficulty: "mid",
        agentId: "agent_2",
        transcript: [],
        promptCandidate: true,
      });

      const userPrompt = messages[1].content;
      assert.ok(userPrompt.includes("Anti-Repetition Rule"));
      assert.ok(userPrompt.includes("Inactivity Prompt"));
      assert.ok(userPrompt.includes('asking "You" for their thoughts'));
    });
  });

  // -------------------------------------------------------------
  // 5. Dialogue Sanitization & Spoken Duration Estimation
  // -------------------------------------------------------------
  describe("Dialogue Sanitization & Duration Estimation", () => {
    it("should strip accidental speaker label prefixes and wrapping quotes", () => {
      assert.equal(
        sanitizeDialogue('Agent 1: "Data shows 40% margin improvement."', "Agent 1"),
        "Data shows 40% margin improvement."
      );
      assert.equal(
        sanitizeDialogue('System: "Welcome to the debate."', "System"),
        "Welcome to the debate."
      );
      assert.equal(
        sanitizeDialogue('"Direct statement without label."', "Agent 2"),
        "Direct statement without label."
      );
    });

    it("should estimate spoken duration proportionally to word count with a minimum of 3s", () => {
      assert.equal(estimateSpokenDurationSeconds("Short"), 3);
      // 25 words / 2.5 = 10s
      const twentyFiveWords = new Array(25).fill("word").join(" ");
      assert.equal(estimateSpokenDurationSeconds(twentyFiveWords), 10);
    });
  });

  // -------------------------------------------------------------
  // 6. Dialogue Generation with AI Caller
  // -------------------------------------------------------------
  describe("Dialogue Generation with Injected AI Caller", () => {
    it("should generate a valid opening turn from the central orchestrator", async () => {
      const mockCaller = async () =>
        'System: "Welcome everyone. Today we analyze the ethics of autonomous vehicles. Let us begin."';

      const openingTurn = await generateOpeningTurn({
        topic: "Autonomous Vehicle Ethics",
        category: "Technology & AI",
        difficulty: "mid",
        aiCaller: mockCaller,
      });

      assert.equal(openingTurn.turnNumber, 1);
      assert.equal(openingTurn.speakerId, "orchestrator");
      assert.equal(openingTurn.speakerLabel, "System");
      assert.equal(openingTurn.personaRole, "system");
      assert.equal(
        openingTurn.content,
        "Welcome everyone. Today we analyze the ethics of autonomous vehicles. Let us begin."
      );
      assert.ok(openingTurn.durationSeconds >= 3);
    });

    it("should generate a valid Agent 1 turn adhering to GDSession turn schema", async () => {
      const mockCaller = async () =>
        'Agent 1: "Statistical evidence from pilot markets indicates a 22% reduction in operational friction."';

      const turn = await generateAgentTurn({
        topic: "Automation in Healthcare",
        category: "Technology & AI",
        difficulty: "mid",
        transcript: [{ turnNumber: 1, speakerId: "orchestrator", content: "Opening" }],
        targetAgentId: "agent_1",
        aiCaller: mockCaller,
      });

      assert.equal(turn.turnNumber, 2);
      assert.equal(turn.speakerId, "agent_1");
      assert.equal(turn.speakerLabel, "Agent 1");
      assert.equal(turn.personaRole, "analytical");
      assert.equal(
        turn.content,
        "Statistical evidence from pilot markets indicates a 22% reduction in operational friction."
      );

      // Validate that this turn conforms to GDSession model's turn schema
      const session = new GDSession({
        userId: new mongoose.Types.ObjectId(),
        idempotencyKey: "test-key-1",
        topic: "Automation in Healthcare",
        category: "Technology & AI",
        creditsDeducted: 150,
        transcript: [turn],
      });
      await session.validate();
    });
  });

  // -------------------------------------------------------------
  // 7. AI Provider Fallback & Error Handling
  // -------------------------------------------------------------
  describe("AI Provider Fallback Behavior", () => {
    it("should execute sequential fallback or return clean 502 error if all providers fail", async () => {
      // Simulate mock provider that fails on both attempts
      const failingCaller = async () => {
        const error = new Error("Connection refused");
        error.status = 502;
        throw error;
      };

      await assert.rejects(
        async () => {
          await generateOpeningTurn({
            topic: "Test Topic",
            category: "Custom",
            aiCaller: failingCaller,
          });
        },
        (err) => {
          assert.equal(err.status, 502);
          return true;
        }
      );
    });
  });

  // -------------------------------------------------------------
  // 8. Candidate Evaluation Service
  // -------------------------------------------------------------
  describe("Candidate Evaluation Service", () => {
    const sampleAiEvaluationJson = JSON.stringify({
      overallScore: 86,
      breakdown: {
        articulation: 88,
        leadership: 82,
        listening: 90,
        criticalThinking: 84,
      },
      strengths: [
        "Structured arguments clearly using concrete examples.",
        "Synthesized points made by Agent 1 and Agent 3 effectively.",
      ],
      improvements: [
        "Step in earlier during the opening phase to anchor the discussion.",
        "Elaborate further on regulatory constraints.",
      ],
      detailedFeedback:
        "The candidate displayed strong active listening and demonstrated agility in reframing the discussion toward practical solutions.",
      turnFeedback: [
        {
          turnNumber: 3,
          speakerLabel: "You",
          critiqueType: "effective_rebuttal",
          comment: "Excellent counterpoint addressing Agent 1's empirical assumptions.",
        },
        {
          turnNumber: 5,
          speakerLabel: "You",
          critiqueType: "strong_point",
          comment: "Crisp synthesis building group consensus.",
        },
      ],
    });

    it("should parse and validate structured evaluation response correctly", () => {
      const parsed = extractJsonFromResponse(`\`\`\`json\n${sampleAiEvaluationJson}\n\`\`\``);
      const normalized = validateAndNormalizeEvaluation(parsed);

      assert.equal(normalized.overallScore, 86);
      assert.equal(normalized.breakdown.articulation, 88);
      assert.equal(normalized.breakdown.leadership, 82);
      assert.equal(normalized.breakdown.listening, 90);
      assert.equal(normalized.breakdown.criticalThinking, 84);
      assert.equal(normalized.strengths.length, 2);
      assert.equal(normalized.improvements.length, 2);
      assert.equal(normalized.turnFeedback.length, 2);
      assert.equal(normalized.turnFeedback[0].critiqueType, "effective_rebuttal");
    });

    it("should clamp scores strictly within 0 to 100", () => {
      assert.equal(clampScore(125), 100);
      assert.equal(clampScore(-15), 0);
      assert.equal(clampScore("85"), 85);
      assert.equal(clampScore("invalid", 70), 70);
    });

    it("should evaluate a full session and produce a schema-compliant evaluation object", async () => {
      const mockAiCaller = async () => sampleAiEvaluationJson;

      const mockSession = {
        topic: "Future of AI Governance",
        category: "Technology & AI",
        difficulty: "executive",
        transcript: [
          { turnNumber: 1, speakerId: "orchestrator", speakerLabel: "System", content: "Opening" },
          { turnNumber: 2, speakerId: "agent_1", speakerLabel: "Agent 1", content: "Point 1" },
          { turnNumber: 3, speakerId: "candidate", speakerLabel: "You", content: "Candidate Point" },
        ],
        telemetry: {
          candidateSpeakingTimeSeconds: 45,
          candidateTurnCount: 1,
          totalTurnsCount: 3,
          interruptionsCount: 0,
        },
      };

      const evaluation = await evaluateGDSession({
        session: mockSession,
        aiCaller: mockAiCaller,
      });

      assert.equal(evaluation.overallScore, 86);
      assert.equal(evaluation.breakdown.articulation, 88);

      // Verify that the evaluation conforms to GDSession model's evaluation schema
      const session = new GDSession({
        userId: new mongoose.Types.ObjectId(),
        idempotencyKey: "test-key-eval",
        topic: mockSession.topic,
        category: mockSession.category,
        creditsDeducted: 150,
        status: "completed",
        telemetry: mockSession.telemetry,
        evaluation,
      });
      await session.validate();
      assert.equal(session.evaluation.overallScore, 86);
    });

    it("should handle malformed AI response gracefully using fallback normalization", async () => {
      const malformedAiCaller = async () => "This is not JSON at all.";

      const mockSession = {
        topic: "Cybersecurity Policy",
        category: "Technology & AI",
        transcript: [],
        telemetry: { candidateSpeakingTimeSeconds: 0 },
      };

      const evaluation = await evaluateGDSession({
        session: mockSession,
        aiCaller: malformedAiCaller,
      });

      assert.ok(evaluation.overallScore >= 0 && evaluation.overallScore <= 100);
      assert.ok(evaluation.strengths.length > 0);
      assert.ok(evaluation.improvements.length > 0);
      assert.ok(evaluation.detailedFeedback.length > 0);
    });
  });
});
