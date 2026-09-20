/**
 * Client-Side Company Profiles Configuration
 * Shared configuration for Target Company features in Interview and Aptitude modules.
 */

export const companyProfiles = {
  amazon: {
    id: "amazon",
    displayName: "Amazon",
    name: "Amazon",
    category: "product",
    interviewStyle:
      "Frame questions around Amazon's 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Deliver Results, Dive Deep, Earn Trust, Have Backbone). Expect behavioral questions using the STAR framework ('Tell me about a time when...') alongside deep technical dive, scalability trade-offs, and operational excellence.",
    interviewCharacter: "Leadership Principles (STAR method) + deep architectural scalability and operational rigor.",
    aptitudeProfile: {
      topics: [],
      recommendedTopics: ["logical-reasoning", "data-interpretation"],
      difficultyDefault: "Hard",
      note: "Aptitude tests are generally not a primary evaluation stage for technical roles at Amazon. We recommend practicing in the Technical Mock Interview module with Amazon selected.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  google: {
    id: "google",
    displayName: "Google",
    name: "Google",
    category: "product",
    interviewStyle:
      "Emphasize deep algorithmic problem-solving, advanced data structures, large-scale distributed systems, clean idiomatic coding, edge-case analysis, concurrency, and open-ended technical curiosity ('How would you design...').",
    interviewCharacter: "Deep algorithmic problem solving (DSA), distributed systems, edge-case rigor, and open-ended design.",
    aptitudeProfile: {
      topics: [],
      recommendedTopics: ["logical-reasoning"],
      difficultyDefault: "Hard",
      note: "Google focuses on Data Structures, Algorithms, and System Design rather than standard aptitude screening. We recommend practicing in the Technical Mock Interview module with Google selected.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  microsoft: {
    id: "microsoft",
    displayName: "Microsoft",
    name: "Microsoft",
    category: "product",
    interviewStyle:
      "Balance core data structures, object-oriented design patterns, practical problem-solving, scalability, and collaboration with a growth mindset. Focus on clean, maintainable, production-ready code.",
    interviewCharacter: "Data structures, OOP design patterns, maintainable code, and growth mindset behavioral alignment.",
    aptitudeProfile: {
      topics: [],
      recommendedTopics: ["quantitative", "logical-reasoning"],
      difficultyDefault: "Hard",
      note: "Microsoft technical hiring emphasizes coding fundamentals, design, and behavioral alignment over standardized aptitude tests. We recommend the Technical Mock Interview module with Microsoft selected.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  tcs: {
    id: "tcs",
    displayName: "TCS",
    name: "TCS",
    category: "service",
    interviewStyle:
      "Focus on computer science fundamentals, OOP concepts, database management (SQL queries & normalization), basic data structures, and foundational programming logic suitable for entry-to-mid level engineering roles.",
    interviewCharacter: "Core CS fundamentals, OOP principles, SQL/databases, and fundamental algorithmic logic.",
    aptitudeProfile: {
      topics: [
        "percentage",
        "profit-loss",
        "time-speed-distance",
        "time-work",
        "number-system",
        "series",
        "coding-decoding",
        "blood-relations",
        "syllogism",
        "reading-comprehension",
        "sentence-correction",
        "error-spotting",
      ],
      recommendedTopics: ["quantitative", "logical-reasoning", "verbal"],
      difficultyDefault: "Medium",
      note: "TCS National Qualifier Test (NQT) emphasizes numerical ability, reasoning ability, and verbal ability with moderate difficulty and strict timing constraints.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  infosys: {
    id: "infosys",
    displayName: "Infosys",
    name: "Infosys",
    category: "service",
    interviewStyle:
      "Emphasize strong programming language fundamentals (Java, Python, C++), software development lifecycle (SDLC), relational databases, and analytical problem-solving clarity.",
    interviewCharacter: "Language fundamentals (Java/Python/C++), SDLC, database concepts, and clear logic.",
    aptitudeProfile: {
      topics: [
        "percentage",
        "profit-loss",
        "time-speed-distance",
        "permutation-combination",
        "probability",
        "seating-arrangement",
        "analytical-puzzles",
        "data-sufficiency",
        "syllogism",
        "reading-comprehension",
        "sentence-correction",
      ],
      recommendedTopics: ["logical-reasoning", "verbal", "quantitative"],
      difficultyDefault: "Hard",
      note: "Infosys assessments focus heavily on complex logical reasoning puzzles, data sufficiency, and commercial arithmetic.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  wipro: {
    id: "wipro",
    displayName: "Wipro",
    name: "Wipro",
    category: "service",
    interviewStyle:
      "Assess core software engineering principles, fundamental programming constructs, problem deconstruction, and standard algorithmic concepts.",
    interviewCharacter: "Software engineering basics, standard coding constructs, and clean problem deconstruction.",
    aptitudeProfile: {
      topics: [
        "percentage",
        "profit-loss",
        "time-speed-distance",
        "average",
        "ratio-proportion",
        "series",
        "coding-decoding",
        "blood-relations",
        "direction-sense",
        "sentence-correction",
        "error-spotting",
        "fill-in-the-blanks",
      ],
      recommendedTopics: ["quantitative", "logical-reasoning", "verbal"],
      difficultyDefault: "Medium",
      note: "Wipro Elite National Talent Hunt (NLTH) tests speed and accuracy across standard quantitative, logical, and verbal foundations.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  accenture: {
    id: "accenture",
    displayName: "Accenture",
    name: "Accenture",
    category: "service",
    interviewStyle:
      "Emphasize application design, agile delivery methodology, modern cloud stack familiarity, and practical scenario-based problem solving.",
    interviewCharacter: "Application architecture, agile workflows, modern technology stack, and scenario troubleshooting.",
    aptitudeProfile: {
      topics: [
        "percentage",
        "ratio-proportion",
        "time-work",
        "algebra",
        "coding-decoding",
        "blood-relations",
        "seating-arrangement",
        "inequalities",
        "sentence-correction",
        "vocabulary-context",
        "critical-reasoning",
      ],
      recommendedTopics: ["quantitative", "verbal", "logical-reasoning"],
      difficultyDefault: "Medium",
      note: "Accenture cognitive assessments emphasize critical reasoning, abstract logic, and commercial math.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  startup: {
    id: "startup",
    displayName: "Startup",
    name: "Startup",
    category: "startup",
    interviewStyle:
      "Focus on high-speed execution, practical full-stack pragmatism, scrappy troubleshooting, technology trade-offs, ownership, and ability to build end-to-end features under ambiguity.",
    interviewCharacter: "Pragmatic full-stack problem solving, scrappy troubleshooting, trade-offs, and high ownership.",
    aptitudeProfile: {
      topics: ["percentage", "time-work", "coding-decoding", "critical-reasoning"],
      recommendedTopics: ["quantitative", "logical-reasoning"],
      difficultyDefault: "Medium",
      note: "Startups often favor practical problem solving and pragmatic logic over standardized aptitude filters.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
  other: {
    id: "other",
    displayName: "Other / Custom",
    name: "Other / Custom",
    category: "custom",
    interviewStyle:
      "Evaluate candidate on core domain fundamentals, practical problem-solving capability, and clear communication relevant to the role.",
    interviewCharacter: "Domain fundamentals, practical reasoning, and clear structured communication.",
    aptitudeProfile: {
      topics: [],
      recommendedTopics: ["quantitative", "logical-reasoning"],
      difficultyDefault: "Medium",
      note: "Standard aptitude preparation covering core quantitative, logical, and verbal concepts.",
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  },
};

/**
 * Normalizes a company name/key and retrieves its profile.
 * Falls back to generic profile if not explicitly matched.
 *
 * @param {string} companyKey
 * @param {string} [customName]
 * @returns {Object|null}
 */
export function getCompanyProfile(companyKey, customName) {
  if (!companyKey || typeof companyKey !== "string") return null;
  const normalized = companyKey.trim().toLowerCase();

  if (normalized === "other") {
    const label = (customName && customName.trim()) || "Target Company";
    return {
      ...companyProfiles.other,
      id: "other",
      displayName: label,
      name: label,
      category: "custom",
      interviewStyle: `Evaluate candidate on core domain fundamentals, practical problem-solving capability, and clear communication relevant to ${label}.`,
      interviewCharacter: `Standard expectations and competencies relevant to ${label}.`,
      aptitudeProfile: {
        ...companyProfiles.other.aptitudeProfile,
        note: `General aptitude assessment relevant to ${label} recruitment patterns.`,
      },
      get aptitudeStyle() {
        return {
          focus: this.aptitudeProfile.note,
          recommendedTopics: this.aptitudeProfile.recommendedTopics,
          difficultyDefault: this.aptitudeProfile.difficultyDefault,
        };
      },
    };
  }

  if (companyProfiles[normalized]) {
    return companyProfiles[normalized];
  }

  // Check display names
  for (const profile of Object.values(companyProfiles)) {
    if (profile.displayName.toLowerCase() === normalized || profile.name.toLowerCase() === normalized) {
      return profile;
    }
  }

  // Fallback for unlisted/custom companies
  const customLabel = companyKey.trim();
  return {
    ...companyProfiles.other,
    id: "other",
    displayName: customLabel,
    name: customLabel,
    category: "custom",
    interviewStyle: `Evaluate candidate on core domain fundamentals, practical problem-solving capability, and clear communication relevant to ${customLabel}.`,
    interviewCharacter: `Standard expectations and competencies relevant to ${customLabel}.`,
    aptitudeProfile: {
      ...companyProfiles.other.aptitudeProfile,
      note: `General aptitude assessment relevant to ${customLabel} recruitment patterns.`,
    },
    get aptitudeStyle() {
      return {
        focus: this.aptitudeProfile.note,
        recommendedTopics: this.aptitudeProfile.recommendedTopics,
        difficultyDefault: this.aptitudeProfile.difficultyDefault,
      };
    },
  };
}

/**
 * Returns options list for UI select dropdowns.
 */
export function getCompanyOptions() {
  return [
    { id: "", name: "None (Standard Practice)", category: "none" },
    { id: "amazon", name: "Amazon", category: "product" },
    { id: "google", name: "Google", category: "product" },
    { id: "microsoft", name: "Microsoft", category: "product" },
    { id: "tcs", name: "TCS", category: "service" },
    { id: "infosys", name: "Infosys", category: "service" },
    { id: "wipro", name: "Wipro", category: "service" },
    { id: "accenture", name: "Accenture", category: "service" },
    { id: "startup", name: "Startup", category: "startup" },
    { id: "other", name: "Other (specify)", category: "custom" },
  ];
}

export default companyProfiles;

