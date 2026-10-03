import { describe, it } from "node:test";
import assert from "node:assert/strict";
import QuestionBank from "../models/questionBank.model.js";
import { SEED_QUESTIONS } from "../config/questionBankSeed.js";
import {
  questionQuerySchema,
  slugParamSchema,
} from "../validators/questionBank.validator.js";

describe("Phase 3A: Question Bank Foundation", () => {
  describe("QuestionBank Model Schema Structure", () => {
    it("verifies required paths and enum constraints on QuestionBank schema", () => {
      const paths = QuestionBank.schema.paths;
      assert.ok(paths.title, "Must have title path");
      assert.ok(paths.slug, "Must have slug path");
      assert.ok(paths.contentType, "Must have contentType path");
      assert.ok(paths.difficulty, "Must have difficulty path");
      assert.ok(paths.category, "Must have category path");
      assert.ok(paths.description, "Must have description path");

      const contentTypeEnum = QuestionBank.schema.path("contentType").enumValues;
      assert.deepEqual(contentTypeEnum.sort(), ["coding", "dsa", "interview", "quiz", "sql", "system_design"].sort());

      const difficultyEnum = QuestionBank.schema.path("difficulty").enumValues;
      assert.deepEqual(difficultyEnum.sort(), ["easy", "hard", "medium"].sort());
    });

    it("verifies polymorphic metadata structures", () => {
      const paths = QuestionBank.schema.paths;
      assert.ok(paths["dsaMetadata.timeLimitMs"], "Must have dsaMetadata subdocument");
      assert.ok(paths["quizMetadata.correctOptionKey"], "Must have quizMetadata subdocument");
      assert.ok(paths["sqlMetadata.referenceQuery"], "Must have sqlMetadata subdocument");
      assert.ok(paths["systemDesignMetadata.scaleEstimates"], "Must have systemDesignMetadata subdocument");
    });
  });

  describe("Question Bank Seed Dataset Integrity", () => {
    it("verifies seed questions exist and have valid slugs and types", () => {
      assert.ok(Array.isArray(SEED_QUESTIONS), "SEED_QUESTIONS must be an array");
      assert.ok(SEED_QUESTIONS.length >= 10, "Should have at least 10 starter seed questions");

      const slugs = new Set();
      for (const q of SEED_QUESTIONS) {
        assert.ok(q.title && q.title.length > 0, "Question must have non-empty title");
        assert.ok(q.slug && q.slug.length > 0, "Question must have slug");
        assert.ok(!slugs.has(q.slug), `Duplicate slug detected: ${q.slug}`);
        slugs.add(q.slug);
        assert.ok(
          ["coding", "dsa", "quiz", "sql", "system_design", "interview"].includes(q.contentType),
          `Invalid contentType: ${q.contentType}`
        );
      }
    });

    it("verifies DSA seed questions contain starter code and test cases", () => {
      const dsaQuestions = SEED_QUESTIONS.filter((q) => q.contentType === "dsa");
      assert.ok(dsaQuestions.length > 0, "Must have DSA seed questions");
      for (const q of dsaQuestions) {
        assert.ok(q.dsaMetadata, "DSA question must have dsaMetadata");
        assert.ok(q.dsaMetadata.starterCode && typeof q.dsaMetadata.starterCode === "object", "Must have starter code object");
        const testCases = q.dsaMetadata.testCases || [
          ...(q.dsaMetadata.sampleTestCases || []),
          ...(q.dsaMetadata.hiddenTestCases || []),
        ];
        assert.ok(Array.isArray(testCases) && testCases.length >= 2, "Must have at least 2 test cases");
      }
    });

    it("verifies Coding Practice seed questions contain starter code and test cases", () => {
      const codingQuestions = SEED_QUESTIONS.filter((q) => q.contentType === "coding");
      assert.ok(codingQuestions.length > 0, "Must have Coding Practice seed questions");
      for (const q of codingQuestions) {
        assert.ok(q.dsaMetadata, "Coding Practice question must have dsaMetadata");
        assert.ok(
          q.dsaMetadata.starterCode && typeof q.dsaMetadata.starterCode === "object",
          "Must have starter code object"
        );
        const testCases = q.dsaMetadata.testCases || [
          ...(q.dsaMetadata.sampleTestCases || []),
          ...(q.dsaMetadata.hiddenTestCases || []),
        ];
        assert.ok(Array.isArray(testCases) && testCases.length >= 2, "Must have at least 2 test cases");
      }
    });

    it("keeps DSA and Coding Practice seed slugs separated", () => {
      const dsaSlugs = new Set(
        SEED_QUESTIONS.filter((q) => q.contentType === "dsa").map((q) => q.slug)
      );
      const codingSlugs = SEED_QUESTIONS
        .filter((q) => q.contentType === "coding")
        .map((q) => q.slug);

      assert.ok(codingSlugs.length > 0, "Coding Practice must have persisted seed records");
      assert.ok(codingSlugs.every((slug) => !dsaSlugs.has(slug)));
    });

    it("verifies Quiz seed questions contain options and explanation", () => {
      const quizQuestions = SEED_QUESTIONS.filter((q) => q.contentType === "quiz");
      assert.ok(quizQuestions.length > 0, "Must have quiz seed questions");
      for (const q of quizQuestions) {
        assert.ok(q.quizMetadata, "Quiz question must have quizMetadata");
        assert.ok(Array.isArray(q.quizMetadata.options), "Quiz must have options");
        assert.ok(q.quizMetadata.options.length >= 3, "Quiz must have at least 3 options");
        assert.ok(q.quizMetadata.correctOptionKey, "Quiz must specify correctOptionKey");
        assert.ok(q.quizMetadata.explanation, "Quiz must provide explanation");
      }
    });

    it("verifies SQL seed questions contain schemaDdl and referenceQuery", () => {
      const sqlQuestions = SEED_QUESTIONS.filter((q) => q.contentType === "sql");
      assert.ok(sqlQuestions.length > 0, "Must have SQL seed questions");
      for (const q of sqlQuestions) {
        assert.ok(q.sqlMetadata, "SQL question must have sqlMetadata");
        assert.ok(q.sqlMetadata.schemaDdl, "SQL must have schemaDdl");
        assert.ok(q.sqlMetadata.referenceQuery, "SQL must have referenceQuery");
      }
    });
  });

  describe("Question Bank Query & Slug Validators", () => {
    it("validates valid query parameters and applies defaults", () => {
      const result = questionQuerySchema.parse({
        contentType: "dsa",
        difficulty: "medium",
      });

      assert.equal(result.contentType, "dsa");
      assert.equal(result.difficulty, "medium");
      assert.equal(result.page, 1);
      assert.equal(result.limit, 20);
    });

    it("rejects invalid contentType", () => {
      assert.throws(
        () =>
          questionQuerySchema.parse({
            contentType: "unsupported_type",
          }),
        /contentType/
      );
    });

    it("validates slug parameters correctly", () => {
      assert.equal(slugParamSchema.parse({ slug: "two-sum" }).slug, "two-sum");
      assert.throws(() => slugParamSchema.parse({ slug: "" }));
    });
  });
});
