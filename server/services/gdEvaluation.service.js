import { defaultAICaller } from "./gdOrchestrator.service.js";

/**
 * Valid critique types aligned with GDSession.evaluation.turnFeedback schema enum.
 */
export const VALID_CRITIQUE_TYPES = [
  "strong_point",
  "effective_rebuttal",
  "constructive_addition",
  "off_topic",
  "interruption",
  "filler",
];

/**
 * Clamps numeric values strictly between 0 and 100.
 */
export const clampScore = (value, defaultVal = 70) => {
  const num = Number(value);
  if (Number.isNaN(num)) return defaultVal;
  return Math.min(100, Math.max(0, Math.round(num)));
};

/**
 * Extracts and parses a JSON object from raw LLM output, handling markdown code fences.
 */
export const extractJsonFromResponse = (rawText = "") => {
  let cleaned = rawText.trim();

  // Strip markdown ```json ... ``` or ``` ... ``` wrappers if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  // Find first '{' and last '}'
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error("No valid JSON object found in AI response.");
  }

  const jsonSubstring = cleaned.substring(startIdx, endIdx + 1);
  return JSON.parse(jsonSubstring);
};

/**
 * Validates and normalizes parsed AI evaluation response against the required schema.
 */
export const validateAndNormalizeEvaluation = (rawEvaluation = {}) => {
  const breakdown = rawEvaluation.breakdown || {};
  const articulation = clampScore(breakdown.articulation, 70);
  const leadership = clampScore(breakdown.leadership, 70);
  const listening = clampScore(breakdown.listening, 70);
  const criticalThinking = clampScore(breakdown.criticalThinking, 70);

  // If overallScore is omitted, compute weighted average
  const overallScore =
    rawEvaluation.overallScore !== undefined
      ? clampScore(rawEvaluation.overallScore, 70)
      : Math.round(
          articulation * 0.25 +
            leadership * 0.25 +
            listening * 0.25 +
            criticalThinking * 0.25
        );

  const normalizeList = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  };

  const strengths = normalizeList(rawEvaluation.strengths);
  if (strengths.length === 0) {
    strengths.push("Demonstrated willingness to contribute to the discussion.");
  }

  const improvements = normalizeList(rawEvaluation.improvements);
  if (improvements.length === 0) {
    improvements.push("Incorporate more concrete data points and empirical references.");
  }

  const detailedFeedback =
    typeof rawEvaluation.detailedFeedback === "string" &&
    rawEvaluation.detailedFeedback.trim()
      ? rawEvaluation.detailedFeedback.trim()
      : "The candidate engaged in the discussion across multiple turns. Continue practicing active listening and synthesizing peers' arguments to further elevate leadership presence.";

  // Validate turn-by-turn feedback
  const turnFeedback = Array.isArray(rawEvaluation.turnFeedback)
    ? rawEvaluation.turnFeedback
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const critiqueType = VALID_CRITIQUE_TYPES.includes(item.critiqueType)
            ? item.critiqueType
            : "constructive_addition";
          return {
            turnNumber: Number(item.turnNumber) || 1,
            speakerLabel: "You",
            critiqueType,
            comment:
              typeof item.comment === "string" && item.comment.trim()
                ? item.comment.trim().slice(0, 500)
                : "Contribution noted in the discussion transcript.",
          };
        })
    : [];

  return {
    overallScore,
    breakdown: {
      articulation,
      leadership,
      listening,
      criticalThinking,
    },
    strengths,
    improvements,
    detailedFeedback,
    turnFeedback,
  };
};

/**
 * Builds the comprehensive prompt for candidate GD evaluation.
 */
export const buildEvaluationPrompt = ({
  topic,
  category,
  difficulty = "mid",
  transcript = [],
  telemetry = {},
}) => {
  const formattedTranscript = transcript
    .map(
      (t) =>
        `[Turn ${t.turnNumber}] ${t.speakerLabel} (${t.personaRole || "speaker"}): "${t.content}"`
    )
    .join("\n\n");

  const telemetrySummary = [
    `- Candidate Speaking Time: ${telemetry.candidateSpeakingTimeSeconds || 0} seconds`,
    `- Candidate Turns Taken: ${telemetry.candidateTurnCount || 0}`,
    `- Total Turns in Session: ${telemetry.totalTurnsCount || transcript.length}`,
    `- Recorded Interruptions: ${telemetry.interruptionsCount || 0}`,
  ].join("\n");

  return [
    {
      role: "system",
      content: `You are an executive assessor and corporate Group Discussion (GD) evaluator.
Evaluate the candidate ("You") on a 100-point scale across 4 core dimensions:
1. Articulation & Clarity (0-100): Clear structure, concise delivery, professional vocabulary, lack of verbal fillers.
2. Leadership & Initiative (0-100): Topic guidance, consensus-building, introducing actionable directions, facilitating peers.
3. Active Listening & Responsiveness (0-100): Referencing points made by Agent 1, Agent 2, or Agent 3, constructive rebuttals, avoiding monologues.
4. Critical Thinking & Depth (0-100): Logical rigor, identification of trade-offs, handling edge cases, empirical depth.

OUTPUT FORMAT:
You MUST respond with valid, parseable JSON only matching this exact schema:
{
  "overallScore": 82,
  "breakdown": {
    "articulation": 85,
    "leadership": 78,
    "listening": 84,
    "criticalThinking": 81
  },
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "improvements": [
    "Improvement area 1",
    "Improvement area 2"
  ],
  "detailedFeedback": "Comprehensive evaluation summary paragraph...",
  "turnFeedback": [
    {
      "turnNumber": 3,
      "speakerLabel": "You",
      "critiqueType": "strong_point",
      "comment": "Specific feedback for this candidate turn."
    }
  ]
}

Available critiqueType values: "strong_point", "effective_rebuttal", "constructive_addition", "off_topic", "interruption", "filler".
Do not wrap with markdown headers. Return JSON only.`,
    },
    {
      role: "user",
      content: `DISCUSSION RECORD TO EVALUATE:
Topic: "${topic}"
Category: ${category}
Difficulty: ${difficulty.toUpperCase()}

OBJECTIVE TELEMETRY:
${telemetrySummary}

FULL DISCUSSION TRANSCRIPT:
${formattedTranscript || "(No transcript turns recorded)"}

Please evaluate the performance of the candidate ("You") and return the structured JSON assessment.`,
    },
  ];
};

/**
 * Executes evaluation of a completed or concluding GD session.
 */
export const evaluateGDSession = async ({
  session,
  aiCaller = defaultAICaller,
}) => {
  if (!session || !session.topic) {
    throw new Error("Valid session object with topic is required for evaluation.");
  }

  const topic = session.topic;
  const category = session.category || "General";
  const difficulty = session.difficulty || "mid";
  const transcript = Array.isArray(session.transcript) ? session.transcript : [];
  const telemetry = session.telemetry || {};

  const messages = buildEvaluationPrompt({
    topic,
    category,
    difficulty,
    transcript,
    telemetry,
  });

  const rawAiResponse = await aiCaller(messages);

  let parsedResponse;
  try {
    parsedResponse = extractJsonFromResponse(rawAiResponse);
  } catch (parseError) {
    console.warn(
      "[GD Evaluation] AI response JSON parsing failed, using fallback normalization:",
      parseError.message
    );
    // Fallback evaluation if AI output could not be parsed as JSON
    parsedResponse = {
      overallScore: 72,
      breakdown: {
        articulation: 72,
        leadership: 70,
        listening: 75,
        criticalThinking: 71,
      },
      strengths: ["Completed participation in the group discussion."],
      improvements: ["Elaborate with deeper empirical frameworks and rebuttals."],
      detailedFeedback:
        "The candidate participated in the session. Detailed qualitative parsing encountered formatting issues, but core participation metrics were recorded.",
      turnFeedback: [],
    };
  }

  return validateAndNormalizeEvaluation(parsedResponse);
};
