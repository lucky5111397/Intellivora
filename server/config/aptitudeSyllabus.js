export const aptitudeCategories = [
  {
    slug: "quantitative",
    name: "Quantitative Aptitude",
    topics: [
      ["number-system", "Number System"], ["percentage", "Percentage"], ["profit-loss", "Profit & Loss"],
      ["ratio-proportion", "Ratio & Proportion"], ["average", "Average"], ["time-work", "Time & Work"],
      ["time-speed-distance", "Time, Speed & Distance"], ["simple-compound-interest", "Simple & Compound Interest"],
      ["probability", "Probability"], ["algebra", "Algebra"], ["simplification", "Simplification"],
      ["hcf-lcm", "HCF & LCM"], ["ages", "Ages"], ["mixtures-alligation", "Mixtures & Alligation"],
      ["permutation-combination", "Permutation & Combination"],
    ],
  },
  {
    slug: "logical-reasoning",
    name: "Logical Reasoning",
    topics: [
      ["series", "Series"], ["coding-decoding", "Coding-Decoding"], ["blood-relations", "Blood Relations"],
      ["direction-sense", "Direction Sense"], ["seating-arrangement", "Seating Arrangement"], ["syllogism", "Syllogism"],
      ["inequalities", "Inequalities"], ["statement-assumption", "Statement & Assumption"],
      ["data-sufficiency", "Data Sufficiency"], ["analytical-puzzles", "Analytical Puzzles"],
    ],
  },
  {
    slug: "data-interpretation",
    name: "Data Interpretation",
    topics: [
      ["tables", "Tables"], ["bar-graphs", "Bar Graphs"], ["line-graphs", "Line Graphs"],
      ["pie-charts", "Pie Charts"], ["caselets", "Caselets"], ["mixed-graphs", "Mixed Graphs"],
      ["data-sufficiency", "Data Sufficiency"], ["missing-data", "Missing Data"],
    ],
  },
  {
    slug: "verbal",
    name: "Verbal Ability & Reading Comprehension",
    topics: [
      ["reading-comprehension", "Reading Comprehension"], ["para-jumbles", "Para Jumbles"],
      ["sentence-correction", "Sentence Correction"], ["error-spotting", "Error Spotting"],
      ["fill-in-the-blanks", "Fill in the Blanks"], ["synonyms-antonyms", "Synonyms & Antonyms"],
      ["vocabulary-context", "Vocabulary in Context"], ["sentence-completion", "Sentence Completion"],
      ["critical-reasoning", "Critical Reasoning"], ["verbal-analogies", "Verbal Analogies"],
    ],
  },
].map((category) => ({
  ...category,
  topics: category.topics.map(([slug, name]) => ({ slug, name })),
}));

export const findCategory = (slug) => aptitudeCategories.find((category) => category.slug === slug);
export const findTopic = (categorySlug, topicSlug) => findCategory(categorySlug)?.topics.find((topic) => topic.slug === topicSlug);
export const categoryForTopic = (topicSlug) => {
  for (const category of aptitudeCategories) {
    if (category.topics.some((topic) => topic.slug === topicSlug)) return category.slug;
  }
  return null;
};
export const findTopicAcrossCategories = (topicSlug) => {
  for (const category of aptitudeCategories) {
    const topic = category.topics.find((t) => t.slug === topicSlug);
    if (topic) return { ...topic, categorySlug: category.slug, categoryName: category.name };
  }
  return null;
};
