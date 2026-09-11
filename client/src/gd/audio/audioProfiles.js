/**
 * Participant audio profiles and persona acoustic tuning.
 * Defines pitch, rate, and preferred voice timbre for each AI peer and orchestrator.
 */

export const AUDIO_PROFILES = {
  agent_1: {
    speakerId: "agent_1",
    speakerLabel: "Agent 1",
    personaRole: "analytical",
    title: "Analytical",
    rate: 0.95,
    pitch: 0.95,
    volume: 1.0,
    preferredGender: "male",
    voiceKeywords: ["david", "mark", "george", "guy", "male", "en-us"],
  },
  agent_2: {
    speakerId: "agent_2",
    speakerLabel: "Agent 2",
    personaRole: "confident",
    title: "Confident",
    rate: 1.02,
    pitch: 1.05,
    volume: 1.0,
    preferredGender: "female",
    voiceKeywords: ["zira", "samantha", "victoria", "jenny", "female", "en-us"],
  },
  agent_3: {
    speakerId: "agent_3",
    speakerLabel: "Agent 3",
    personaRole: "critical_thinker",
    title: "Critical Thinker",
    rate: 0.90,
    pitch: 1.15,
    volume: 1.0,
    preferredGender: "male",
    voiceKeywords: ["richard", "james", "natural", "aria", "en-gb", "male"],
  },
  orchestrator: {
    speakerId: "orchestrator",
    speakerLabel: "System",
    personaRole: "system",
    title: "Moderator",
    rate: 0.96,
    pitch: 1.00,
    volume: 1.0,
    preferredGender: "neutral",
    voiceKeywords: ["google", "natural", "en-us", "default"],
  },
};

/**
 * Returns the audio profile for a given speaker ID, defaulting to orchestrator.
 */
export const getAudioProfile = (speakerId) => {
  return AUDIO_PROFILES[speakerId] || AUDIO_PROFILES.orchestrator;
};

/**
 * Selects the most appropriate available browser speech synthesis voice
 * for a specific speaker profile.
 */
export const matchVoiceForProfile = (voices = [], profile = {}) => {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const keywords = profile.voiceKeywords || [];
  const englishVoices = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("en"));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  // 1. Exact keyword match
  for (const kw of keywords) {
    const matched = pool.find((v) => (v.name || "").toLowerCase().includes(kw));
    if (matched) return matched;
  }

  // 2. Gender heuristics
  if (profile.preferredGender === "female") {
    const femaleVoice = pool.find(
      (v) =>
        (v.name || "").toLowerCase().includes("female") ||
        (v.name || "").toLowerCase().includes("zira") ||
        (v.name || "").toLowerCase().includes("samantha")
    );
    if (femaleVoice) return femaleVoice;
  } else if (profile.preferredGender === "male") {
    const maleVoice = pool.find(
      (v) =>
        (v.name || "").toLowerCase().includes("male") ||
        (v.name || "").toLowerCase().includes("david") ||
        (v.name || "").toLowerCase().includes("mark")
    );
    if (maleVoice) return maleVoice;
  }

  // 3. Fallback: distribute across voice list based on speaker ID hash
  const speakerIndex = {
    agent_1: 0,
    agent_2: 1,
    agent_3: 2,
    orchestrator: 3,
  }[profile.speakerId] ?? 0;

  return pool[speakerIndex % pool.length] || pool[0] || null;
};
