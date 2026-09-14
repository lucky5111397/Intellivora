import { defaultAICaller } from "./gdOrchestrator.service.js";
import { generateStructured } from "./aiGateway.service.js";

export const VALID_CRITIQUE_TYPES = [
  "strong_point",
  "effective_rebuttal",
  "constructive_addition",
  "off_topic",
  "interruption",
  "filler",
];

export const clampScore = (value, defaultVal = 70) => {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return defaultVal;
  }

  return Math.min(100, Math.max(0, Math.round(num)));
};

/**
 * Extracts a JSON object from raw AI output.
 * Retained for compatibility with existing tests and custom callers.
 */
export const extractJsonFromResponse = (rawText = "") => {
  if (typeof rawText !== "string") {
    throw new Error("AI response must be a string.");
  }

  let cleaned = rawText.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");

  if (
    startIdx === -1 ||
    endIdx === -1 ||
    endIdx <= startIdx
  ) {
    throw new Error("No valid JSON object found in AI response.");
  }

  const jsonSubstring = cleaned.substring(
    startIdx,
    endIdx + 1
  );

  return JSON.parse(jsonSubstring);
};

export const validateAndNormalizeEvaluation = (
  rawEvaluation = {}
) => {
  if (
    !rawEvaluation ||
    typeof rawEvaluation !== "object"
  ) {
    throw new Error("Invalid GD evaluation response.");
  }

  const breakdown = rawEvaluation.breakdown || {};

  const articulation = clampScore(
    breakdown.articulation,
    70
  );

  const leadership = clampScore(
    breakdown.leadership,
    70
  );

  const listening = clampScore(
    breakdown.listening,
    70
  );

  const criticalThinking = clampScore(
    breakdown.criticalThinking,
    70
  );

  const overallScore =
    rawEvaluation.overallScore !== undefined
      ? clampScore(rawEvaluation.overallScore, 70)
      : Math.round(
          articulation * 0.25 +
            leadership * 0.25 +
            listening * 0.25 +
            criticalThinking * 0.25
        );

  const normalizeList = (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) =>
        typeof item === "string" ? item.trim() : ""
      )
      .filter(Boolean);
  };

  const strengths = normalizeList(
    rawEvaluation.strengths
  );

  if (strengths.length === 0) {
    strengths.push(
      "Demonstrated willingness to contribute to the discussion."
    );
  }

  const improvements = normalizeList(
    rawEvaluation.improvements
  );

  if (improvements.length === 0) {
    improvements.push(
      "Incorporate more concrete data points and empirical references."
    );
  }

  const detailedFeedback =
    typeof rawEvaluation.detailedFeedback === "string" &&
    rawEvaluation.detailedFeedback.trim()
      ? rawEvaluation.detailedFeedback.trim()
      : "The candidate engaged in the discussion across multiple turns. Continue practicing active listening and synthesizing peers' arguments to further elevate leadership presence.";

  const turnFeedback = Array.isArray(
    rawEvaluation.turnFeedback
  )
    ? rawEvaluation.turnFeedback
        .filter(
          (item) =>
            item && typeof item === "object"
        )
        .map((item) => {
          const critiqueType =
            VALID_CRITIQUE_TYPES.includes(
              item.critiqueType
            )
              ? item.critiqueType
              : "constructive_addition";

          return {
            turnNumber:
              Number(item.turnNumber) || 1,
            speakerLabel: String(
              item.speakerLabel || "You"
            ),
            critiqueType,
            comment:
              typeof item.comment === "string" &&
              item.comment.trim()
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

export const buildEvaluationPrompt = ({
  topic,
  category,
  difficulty = "mid",
  transcript = [],
  telemetry = {},
}) => {
  const formattedTranscript = transcript
    .map(
      (turn) =>
        `[Turn ${turn.turnNumber}] ${turn.speakerLabel} (${turn.personaRole || "speaker"}): "${turn.content}"`
    )
    .join("\n\n");

  const telemetrySummary = [
    `- Total Discussion Turns: ${
      telemetry.totalTurnsCount || transcript.length
    }`,
    `- Candidate Turns: ${
      telemetry.candidateTurnCount || 0
    }`,
    `- Candidate Speaking Time: ${
      telemetry.candidateSpeakingTimeSeconds || 0
    } seconds`,
    `- Recorded Interruptions: ${
      telemetry.interruptionsCount || 0
    }`,
    `- Total Session Duration: ${
      telemetry.totalSessionDurationSeconds || 0
    } seconds`,
  ].join("\n");

  return [
    {
      role: "system",
      content: `You are an executive assessor and corporate Group Discussion evaluator.

Evaluate the candidate ("You") on a 100-point scale across four core dimensions:

1. Articulation & Clarity (0-100): Clear structure, concise delivery, professional vocabulary, and lack of verbal fillers.
2. Leadership & Initiative (0-100): Topic guidance, consensus-building, actionable directions, and facilitation of peers.
3. Active Listening & Responsiveness (0-100): Referencing points made by Agent 1, Agent 2, or Agent 3, constructive rebuttals, and avoiding monologues.
4. Critical Thinking & Depth (0-100): Logical rigor, identification of trade-offs, handling edge cases, and empirical depth.

Return valid JSON only using this schema:

  "overallScore": 78,
  "breakdown": {
    "articulation": 80,
    "leadership": 75,
    "listening": 78,
    "criticalThinking": 82
  },
  "strengths": [
    "Concrete observation 1",
    "Concrete observation 2"
  ],
  "improvements": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ],
  "detailedFeedback": "Comprehensive holistic evaluation of the candidate's performance.",
  "turnFeedback": [
    {
      "turnNumber": 3,
      "speakerLabel": "You",
      "critiqueType": "strong_point",
      "comment": "Specific feedback for this candidate turn."
    }
  ]
}

Rules:
- All scores must be integers from 0 to 100.
- Evaluate only the candidate ("You").
- Base conclusions on the supplied transcript and telemetry.
- Do not invent events that are not present in the discussion.
- Use specific and actionable feedback.
- Do not use fictional participant names.
- Available critiqueType values: "strong_point", "effective_rebuttal", "constructive_addition", "off_topic", "interruption", "filler".
- Return JSON only.
- Do not wrap the response in markdown.`,
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

Evaluate the performance of the candidate ("You") and return the structured JSON assessment.`,
    },
  ];
};

export const evaluateGDSession = async ({
  session,
  aiCaller = defaultAICaller,
}) => {
  if (!session || !session.topic) {
    throw new Error(
      "Valid session object with topic is required for evaluation."
    );
  }

  const topic = session.topic;
  const category = session.category || "General";
  const difficulty = session.difficulty || "mid";

  const transcript = Array.isArray(session.transcript)
    ? session.transcript
    : [];

  const telemetry = session.telemetry || {};

  const messages = buildEvaluationPrompt({
    topic,
    category,
    difficulty,
    transcript,
    telemetry,
  });

  if (aiCaller === defaultAICaller) {
    return generateStructured({
      task: "gd_evaluation",
      messages,
      schemaValidator: validateAndNormalizeEvaluation,
    });
  }

  const rawAiResponse = await aiCaller(messages);

  let parsedResponse;

  try {
    parsedResponse =
      typeof rawAiResponse === "string"
        ? extractJsonFromResponse(rawAiResponse)
        : rawAiResponse;
  } catch (parseError) {
    console.warn(
      "[GD Evaluation] AI response JSON parsing failed:",
      parseError.message
    );

    parsedResponse = {
      overallScore: 72,
      breakdown: {
        articulation: 72,
        leadership: 70,
        listening: 75,
        criticalThinking: 71,
      },
      strengths: [
        "Completed participation in the group discussion.",
      ],
      improvements: [
        "Elaborate with deeper empirical frameworks and rebuttals.",
      ],
      detailedFeedback:
        "The candidate participated in the session. Detailed qualitative parsing encountered formatting issues, but core participation metrics were recorded.",
      turnFeedback: [],
    };
  }

  return validateAndNormalizeEvaluation(
    parsedResponse
  );
};