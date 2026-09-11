/**
 * Curated Group Discussion topic bank and configuration constants.
 * Aligned with backend GDSession validation schemas and Stitch design tokens.
 */

export const VALID_CATEGORIES = [
  "Technology & AI",
  "Business & Economics",
  "Social & Ethical",
  "Case Studies",
  "Custom",
];

export const DIFFICULTY_OPTIONS = [
  {
    id: "entry",
    label: "Easy / Entry",
    shortLabel: "Easy",
    badge: "CI: 35",
    subBadge: "Supportive Cohort",
    description: "Gentle pacing, structured turns, and minimal interruptions from peers.",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgHover: "hover:border-emerald-500/50",
  },
  {
    id: "mid",
    label: "Medium / Mid",
    shortLabel: "Medium",
    badge: "CI: 65",
    subBadge: "Placement Benchmark",
    description: "Standard boardroom tempo with assertive counter-arguments and rebuttals.",
    accentColor: "text-indigo-400",
    borderColor: "border-indigo-500/40",
    bgHover: "hover:border-indigo-500/60",
    isRecommended: true,
  },
  {
    id: "executive",
    label: "Hard / Executive",
    shortLabel: "Hard",
    badge: "CI: 95",
    subBadge: "Stress Assessment",
    description: "Rapid interjections, assertive cross-questioning, and adversarial pushbacks.",
    accentColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgHover: "hover:border-rose-500/50",
  },
];

export const DURATION_OPTIONS = [
  { minutes: 5, label: "5 min", subLabel: "Sprint", description: "Quick 5-minute rapid exchange" },
  { minutes: 10, label: "10 min", subLabel: "Standard", description: "Balanced corporate discussion length", isRecommended: true },
  { minutes: 15, label: "15 min", subLabel: "Deep", description: "Comprehensive multi-turn debate" },
];

export const TOPIC_BANK = {
  "Technology & AI": [
    {
      id: "ai-jobs-replacement",
      title: "Will Artificial Intelligence replace human jobs?",
      focus: "Economic dislocation, augmentative productivity vs structural unemployment, and workforce reskilling imperatives.",
      benchmark: "Campus Priority Benchmark",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    },
    {
      id: "ai-legal-personhood",
      title: "Should Autonomous Artificial Intelligence Systems Have Legal Personhood?",
      focus: "Algorithmic liability, copyright ownership of synthetic works, and ethical personhood precedents.",
      benchmark: "Tier-1 Placement Priority",
      suggestedDifficulty: "executive",
      suggestedDuration: 10,
    },
    {
      id: "quantum-cryptography",
      title: "Quantum Computing: The End of Modern Cybersecurity Infrastructure?",
      focus: "Post-quantum encryption transition, nation-state surveillance, and global financial risks.",
      benchmark: "Tech Leadership Benchmark",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    },
    {
      id: "open-source-ai-regulation",
      title: "Should Open-Source Generative AI Models Be Strictly Regulated by Governments?",
      focus: "Democratization of innovation vs existential biosecurity and cybersecurity hazards.",
      benchmark: "Executive Policy Debate",
      suggestedDifficulty: "executive",
      suggestedDuration: 15,
    },
  ],
  "Business & Economics": [
    {
      id: "cbdc-cashless-economy",
      title: "Should Central Banks Replace Physical Cash with Central Bank Digital Currencies (CBDCs)?",
      focus: "Monetary sovereignty, financial privacy, offline resilience, and cross-border settlement speed.",
      benchmark: "Fintech & Banking Priority",
      suggestedDifficulty: "executive",
      suggestedDuration: 10,
    },
    {
      id: "remote-vs-rto",
      title: "Remote Work vs Return to Office: Long-term Impact on Organizational Culture",
      focus: "Talent retention, mentorship degradation, productivity paradox, and corporate real estate.",
      benchmark: "Corporate HR Benchmark",
      suggestedDifficulty: "entry",
      suggestedDuration: 10,
    },
    {
      id: "gig-economy-fairness",
      title: "Gig Economy: Empowerment or Exploitation of the Modern Workforce?",
      focus: "Flexibility and entrepreneurship vs social safety nets, healthcare, and collective bargaining.",
      benchmark: "MBA Placement Benchmark",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    },
    {
      id: "esg-corporate-mandates",
      title: "Are ESG Mandates Creating Real Value or Serving as Corporate Greenwashing?",
      focus: "Fiduciary responsibilities to shareholders vs long-term sustainability and regulatory compliance.",
      benchmark: "Boardroom Strategy Focus",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    },
  ],
  "Social & Ethical": [
    {
      id: "social-media-algorithms",
      title: "Social Media Algorithms: Freedom of Expression vs Public Safety and Mental Health",
      focus: "Platform accountability, polarization feedback loops, and youth wellbeing interventions.",
      benchmark: "Societal Policy Benchmark",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    },
    {
      id: "universal-basic-income",
      title: "Universal Basic Income: Necessary Cushion for Automation or Economic Hazard?",
      focus: "Fiscal feasibility, inflation pressures, work incentives, and poverty alleviation.",
      benchmark: "Socio-Economic Focus",
      suggestedDifficulty: "mid",
      suggestedDuration: 15,
    },
    {
      id: "climate-vs-industrial-growth",
      title: "Climate Action vs Industrial Growth in Developing Nations: Who Bears the Cost?",
      focus: "Historical emissions debt, green technology transfer, and poverty eradication priorities.",
      benchmark: "Global Affairs Priority",
      suggestedDifficulty: "executive",
      suggestedDuration: 10,
    },
  ],
  "Case Studies": [
    {
      id: "global-cloud-outage",
      title: "Crisis Management: Handling a Global Cloud Infrastructure and Banking Outage",
      focus: "Systemic concentration risk, incident communication, redundancy failures, and regulatory fines.",
      benchmark: "Executive Crisis Simulation",
      suggestedDifficulty: "executive",
      suggestedDuration: 10,
    },
    {
      id: "quick-commerce-disruption",
      title: "Quick-Commerce Disruption: Survival Strategies for Traditional Mom-and-Pop Retail",
      focus: "Dark-store economics, ultra-fast logistics margins, and grassroots retail displacement.",
      benchmark: "Strategy Case Benchmark",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    },
    {
      id: "healthcare-ai-liability",
      title: "AI Medical Diagnostics: Who is Liable When an Algorithm Causes Medical Harm?",
      focus: "Physician deference, algorithmic black boxes, hospital protocols, and medical malpractice law.",
      benchmark: "Bioethics & Law Benchmark",
      suggestedDifficulty: "executive",
      suggestedDuration: 15,
    },
  ],
  Custom: [],
};

/**
 * Returns topics for a selected category, defaulting to Technology & AI.
 */
export const getTopicsByCategory = (category) => {
  return TOPIC_BANK[category] || TOPIC_BANK["Technology & AI"];
};

/**
 * Returns a random topic for a category.
 */
export const getRandomTopicByCategory = (category) => {
  const list = getTopicsByCategory(category);
  if (!list || list.length === 0) {
    return {
      id: "default-custom",
      title: "Future of Global Innovation and Workplace Leadership",
      focus: "General discussion on strategic adaptability and communication.",
      benchmark: "Custom Benchmark",
      suggestedDifficulty: "mid",
      suggestedDuration: 10,
    };
  }
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
};

/**
 * Validates GD session configuration form values against backend schema rules.
 */
export const validateGDSetupForm = ({
  topic,
  category,
  difficulty = "mid",
  durationMinutes = 10,
  maxTurns = 30,
}) => {
  const errors = {};

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    errors.topic = "Topic is required.";
  } else if (topic.trim().length < 5) {
    errors.topic = "Topic must be at least 5 characters.";
  } else if (topic.trim().length > 300) {
    errors.topic = "Topic cannot exceed 300 characters.";
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${VALID_CATEGORIES.join(", ")}`;
  }

  const validDifficulties = ["entry", "mid", "executive"];
  if (!validDifficulties.includes(difficulty)) {
    errors.difficulty = "Invalid difficulty level.";
  }

  const durationNum = Number(durationMinutes);
  if (Number.isNaN(durationNum) || durationNum < 3 || durationNum > 30) {
    errors.durationMinutes = "Duration must be between 3 and 30 minutes.";
  }

  const maxTurnsNum = Number(maxTurns);
  if (Number.isNaN(maxTurnsNum) || maxTurnsNum < 5 || maxTurnsNum > 50) {
    errors.maxTurns = "Max turns must be between 5 and 50.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
