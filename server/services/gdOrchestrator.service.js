import { generateText } from "./aiGateway.service.js";

/**
 * Strict participant persona configurations.
 * UI identities remain You, Agent 1, Agent 2, and Agent 3.
 */
export const AGENT_PERSONAS = {
  agent_1: {
    speakerId: "agent_1",
    speakerLabel: "Agent 1",
    personaRole: "analytical",
    title: "Analytical",
    stylePrompt: `You are "Agent 1" in a formal group discussion.
Your persona is Analytical:
- Data-driven, empirical, logical, and structured.
- You think in frameworks such as market economics, statistical trade-offs, and technological limits.
- You speak in a calm, precise, measured, and academic tone.
- Reference concrete metrics, cause-and-effect reasoning, and unit economics.`,
  },

  agent_2: {
    speakerId: "agent_2",
    speakerLabel: "Agent 2",
    personaRole: "confident",
    title: "Confident",
    stylePrompt: `You are "Agent 2" in a formal group discussion.
Your persona is Confident:
- Action-oriented, decisive, executive leadership mindset, consensus-builder.
- Focus on practical real-world execution, organizational alignment, and strategic impact.
- You speak with an assertive, energetic, persuasive, and grounded voice.
- Synthesize disparate points into forward-looking solutions.`,
  },

  agent_3: {
    speakerId: "agent_3",
    speakerLabel: "Agent 3",
    personaRole: "critical_thinker",
    title: "Critical Thinker",
    stylePrompt: `You are "Agent 3" in a formal group discussion.
Your persona is Critical Thinker (Devil's Advocate):
- Questioning, probing, highlights edge cases, ethical risks, regulatory roadblocks.
- Interrogate hidden assumptions that others take for granted.
- You speak with an inquisitive, sharp, nuanced, and counter-intuitive perspective.
- Highlight potential second-order unintended consequences.`,
  },
};

export const ORCHESTRATOR_CONFIG = {
  speakerId: "orchestrator",
  speakerLabel: "System",
  personaRole: "system",
};

/**
 * Centralized AI caller for Group Discussion generation.
 */
export const defaultAICaller = async (
  messages,
  task = "gd_turn"
) => {
  return generateText({
    task,
    messages,
  });
};

/**
 * Checks if the group discussion has reached its completion boundary.
 */
export const isDiscussionComplete = ({
  transcript = [],
  maxTurns = 30,
  durationMinutes = 10,
  elapsedTimeSeconds = 0,
}) => {
  if (transcript.length >= maxTurns) {
    return true;
  }

  if (
    durationMinutes &&
    elapsedTimeSeconds >= durationMinutes * 60
  ) {
    return true;
  }

  return false;
};

/**
 * Selects the next speaker based on floor requests,
 * candidate inactivity, and balanced agent participation.
 */
export const selectNextSpeaker = ({
  transcript = [],
  maxTurns = 30,
  floorRequestedByCandidate = false,
}) => {
  if (transcript.length >= maxTurns) {
    return {
      speakerId: null,
      speakerLabel: null,
      personaRole: null,
      isComplete: true,
      promptCandidate: false,
    };
  }

  const lastTurn = transcript[transcript.length - 1];
  const lastSpeakerId = lastTurn?.speakerId;

  if (
    floorRequestedByCandidate &&
    lastSpeakerId !== "candidate"
  ) {
    return {
      speakerId: "candidate",
      speakerLabel: "You",
      personaRole: "candidate",
      isComplete: false,
      promptCandidate: false,
    };
  }

  let turnsSinceCandidateSpoke = 0;

  for (let i = transcript.length - 1; i >= 0; i--) {
    if (transcript[i].speakerId === "candidate") {
      break;
    }

    turnsSinceCandidateSpoke++;
  }

  const shouldPromptCandidate =
    turnsSinceCandidateSpoke >= 2;

  const eligibleAgentIds = [
    "agent_1",
    "agent_2",
    "agent_3",
  ].filter((id) => id !== lastSpeakerId);

  const turnCounts = {
    agent_1: 0,
    agent_2: 0,
    agent_3: 0,
  };

  transcript.forEach((turn) => {
    if (turnCounts[turn.speakerId] !== undefined) {
      turnCounts[turn.speakerId]++;
    }
  });

  eligibleAgentIds.sort(
    (a, b) => turnCounts[a] - turnCounts[b]
  );

  const selectedAgentId =
    eligibleAgentIds[0] || "agent_1";

  const persona = AGENT_PERSONAS[selectedAgentId];

  return {
    speakerId: persona.speakerId,
    speakerLabel: persona.speakerLabel,
    personaRole: persona.personaRole,
    isComplete: false,
    promptCandidate: shouldPromptCandidate,
  };
};

/**
 * Builds a context-pruned prompt for an AI agent turn.
 */
export const buildAgentPrompt = ({
  topic,
  category,
  difficulty = "mid",
  agentId,
  transcript = [],
  promptCandidate = false,
}) => {
  const persona =
    AGENT_PERSONAS[agentId] || AGENT_PERSONAS.agent_1;

  const recentTurns = transcript.slice(-6);

  const formattedTranscript = recentTurns
    .map(
      (turn) =>
        `${turn.speakerLabel} (${turn.personaRole}): "${turn.content}"`
    )
    .join("\n\n");

  const promptSections = [
    "DISCUSSION CONTEXT:",
    `- Topic: "${topic}"`,
    `- Category: ${category}`,
    `- Difficulty Level: ${difficulty.toUpperCase()}`,
    `- You are: ${persona.speakerLabel} (${persona.title})`,
    "",
    "RECENT DISCUSSION TRANSCRIPT:",
    formattedTranscript ||
      "(Discussion has just opened. You are making an early statement.)",
    "",
    "INSTRUCTIONS FOR YOUR TURN:",
    "- Length: Exactly 2 to 4 concise sentences (approximately 50 to 90 words).",
    `- Tone & Perspective: Strictly embody your persona (${persona.title}).`,
    '- Anti-Repetition Rule: Do NOT start with generic agreement like "I agree with the previous speaker" or "That is a great point". Immediately introduce a concrete point, framework, counter-example, or strategic trade-off.',
    '- Participant Identifiers: When addressing others, use ONLY "Agent 1", "Agent 2", "Agent 3", or "You" (the human candidate). NEVER invent fictional names.',
  ];

  if (promptCandidate) {
    promptSections.push(
      '- Inactivity Prompt: The candidate ("You") has been quiet. Conclude your turn by directly asking "You" for their thoughts on your argument.'
    );
  }

  promptSections.push(
    "",
    `Provide ONLY your spoken dialogue. Do not include quotes, markdown headers, or labels like "${persona.speakerLabel}:".`
  );

  return [
    {
      role: "system",
      content: `${persona.stylePrompt}\nYou are participating in a group discussion. Provide dialogue only.`,
    },
    {
      role: "user",
      content: promptSections.join("\n"),
    },
  ];
};

/**
 * Cleans accidental speaker labels and surrounding quotes.
 */
export const sanitizeDialogue = (
  text = "",
  speakerLabel = ""
) => {
  let cleaned = String(text).trim();

  const labelPrefixRegex = new RegExp(
    `^(${speakerLabel}|Agent\\s*\\d+|System):?\\s*`,
    "i"
  );

  cleaned = cleaned.replace(labelPrefixRegex, "");

  if (
    cleaned.startsWith('"') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
};

/**
 * Estimates spoken duration using an approximate speaking rate.
 */
export const estimateSpokenDurationSeconds = (
  text = ""
) => {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(3, Math.round(words / 2.5));
};

/**
 * Generates the opening framing statement.
 */
export const generateOpeningTurn = async ({
  topic,
  category,
  difficulty = "mid",
  aiCaller = defaultAICaller,
}) => {
  const messages = [
    {
      role: "system",
      content:
        "You are the central orchestrator of a group discussion simulation. Provide concise opening statements only.",
    },
    {
      role: "user",
      content: `Please provide an opening statement to kick off a formal Group Discussion.
Topic: "${topic}"
Category: ${category}
Difficulty: ${difficulty}

Rules:
- 2 to 3 concise sentences.
- Neutral and professional, framing the core dilemma of the topic.
- Conclude by formally inviting opening arguments.
- Do NOT use fictional names.
- Output spoken text only without labels.`,
    },
  ];

  const rawText =
    aiCaller === defaultAICaller
      ? await defaultAICaller(messages, "gd_opening")
      : await aiCaller(messages);

  const content = sanitizeDialogue(
    rawText,
    "System"
  );

  return {
    turnNumber: 1,
    speakerId: ORCHESTRATOR_CONFIG.speakerId,
    speakerLabel: ORCHESTRATOR_CONFIG.speakerLabel,
    personaRole: ORCHESTRATOR_CONFIG.personaRole,
    content,
    timestamp: new Date(),
    durationSeconds:
      estimateSpokenDurationSeconds(content),
    interruptedPrevious: false,
  };
};

/**
 * Generates an AI agent turn within the active session.
 */
export const generateAgentTurn = async ({
  topic,
  category,
  difficulty = "mid",
  transcript = [],
  targetAgentId,
  promptCandidate = false,
  aiCaller = defaultAICaller,
}) => {
  const agentId =
    targetAgentId || "agent_1";

  const persona =
    AGENT_PERSONAS[agentId] ||
    AGENT_PERSONAS.agent_1;

  const messages = buildAgentPrompt({
    topic,
    category,
    difficulty,
    agentId,
    transcript,
    promptCandidate,
  });

  const rawResponse =
    aiCaller === defaultAICaller
      ? await defaultAICaller(messages, "gd_turn")
      : await aiCaller(messages);

  const content = sanitizeDialogue(
    rawResponse,
    persona.speakerLabel
  );

  const turnNumber = transcript.length + 1;
  const durationSeconds =
    estimateSpokenDurationSeconds(content);

  return {
    turnNumber,
    speakerId: persona.speakerId,
    speakerLabel: persona.speakerLabel,
    personaRole: persona.personaRole,
    content,
    timestamp: new Date(),
    durationSeconds,
    interruptedPrevious: false,
  };
};