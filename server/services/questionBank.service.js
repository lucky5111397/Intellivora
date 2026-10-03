import QuestionBank from "../models/questionBank.model.js";
import { SEED_QUESTIONS } from "../config/questionBankSeed.js";

export class QuestionBankService {
  static activeFilter() {
    return { $or: [{ active: true }, { isActive: true }] };
  }

  /**
   * Seeds initial curated problems if not already present.
   */
  static async seedInitialQuestions() {
    try {
      let insertedCount = 0;
      for (const item of SEED_QUESTIONS) {
        const existing = await QuestionBank.findOne({ slug: item.slug });
        if (!existing) {
          await QuestionBank.create(item);
          insertedCount++;
        }
      }
      return { success: true, insertedCount };
    } catch (error) {
      console.error("[QuestionBankService] seedInitialQuestions error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lists questions with pagination, difficulty filtering, and tag search.
   * Strips hidden test cases and answer keys for candidate safety.
   */
  static async listQuestions({
    contentType,
    difficulty,
    category,
    tag,
    company,
    search,
    page = 1,
    limit = 20,
  } = {}) {
    const filter = { $and: [this.activeFilter()] };

    if (contentType) filter.contentType = contentType;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (company) filter.companyTags = { $regex: new RegExp(`^${company}$`, "i") };
    if (search) {
      filter.$and.push({
        $or: [
        { title: { $regex: search, $options: "i" } },
        { subtopic: { $regex: search, $options: "i" } },
        ],
      });
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [items, total] = await Promise.all([
      QuestionBank.find(filter)
        .select("-dsaMetadata.hiddenTestCases -quizMetadata.correctOptionKey -sqlMetadata.referenceQuery")
        .sort({ difficulty: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionBank.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves single question by slug.
   * By default strips hidden test cases and reference answers.
   */
  static async getQuestionBySlug(slug, includeHidden = false) {
    let query = QuestionBank.findOne({ slug, ...this.activeFilter() });
    if (!includeHidden) {
      query = query.select(
        "-dsaMetadata.hiddenTestCases -quizMetadata.correctOptionKey -sqlMetadata.referenceQuery"
      );
    }
    return query.lean();
  }

  /**
   * Internal helper: retrieves question with full hidden test cases for execution engine.
   */
  static async getAuthoritativeQuestion(slug) {
    return QuestionBank.findOne({ slug, ...this.activeFilter() }).lean();
  }

  /**
   * Aggregates distinct categories and question counts by content type.
   */
  static async getCategories(contentType) {
    const filter = this.activeFilter();
    if (contentType) filter.contentType = contentType;

    const categories = await QuestionBank.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          difficulties: { $addToSet: "$difficulty" },
          subtopics: { $addToSet: "$subtopic" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return categories.map((c) => ({
      category: c._id,
      count: c.count,
      difficulties: c.difficulties,
      subtopics: c.subtopics.filter(Boolean),
    }));
  }
}

export default QuestionBankService;
