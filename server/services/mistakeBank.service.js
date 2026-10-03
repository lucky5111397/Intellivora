import MistakeBank from "../models/mistakeBank.model.js";

class MistakeBankService {
  /**
   * Records or increments a candidate mistake.
   * If a record with the same title and module exists for this user, increments attemptCount.
   */
  async recordMistake(userId, data) {
    if (!userId) throw new Error("userId is required to record a mistake.");

    const existing = await MistakeBank.findOne({
      userId,
      sourceModule: data.sourceModule,
      questionTitle: data.questionTitle,
    });

    if (existing) {
      existing.attemptCount += 1;
      if (data.userAnswer !== undefined) existing.userAnswer = data.userAnswer;
      if (data.expectedAnswer !== undefined) existing.expectedAnswer = data.expectedAnswer;
      if (data.explanation) existing.explanation = data.explanation;
      if (existing.revisionStatus === "mastered") {
        existing.revisionStatus = "unresolved"; // Regressed on re-attempt
      }
      return await existing.save();
    }

    return await MistakeBank.create({
      userId,
      sourceModule: data.sourceModule,
      questionId: data.questionId || null,
      questionTitle: data.questionTitle,
      questionSlug: data.questionSlug || "",
      category: data.category || "General",
      difficulty: data.difficulty || "medium",
      tags: data.tags || [],
      userAnswer: data.userAnswer || "",
      expectedAnswer: data.expectedAnswer || "",
      explanation: data.explanation || "",
      notes: data.notes || "",
      revisionStatus: "unresolved",
      attemptCount: 1,
    });
  }

  /**
   * Queries candidate mistakes with pagination and filtering.
   */
  async getUserMistakes(userId, { page = 1, limit = 20, sourceModule = "all", revisionStatus = "all", search = "" } = {}) {
    const query = { userId };

    if (sourceModule && sourceModule !== "all") {
      query.sourceModule = sourceModule;
    }

    if (revisionStatus && revisionStatus !== "all") {
      query.revisionStatus = revisionStatus;
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { questionTitle: { $regex: sanitized, $options: "i" } },
        { category: { $regex: sanitized, $options: "i" } },
        { tags: { $regex: sanitized, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [mistakes, total] = await Promise.all([
      MistakeBank.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MistakeBank.countDocuments(query),
    ]);

    return {
      mistakes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Updates revision status for a candidate mistake with ownership enforcement.
   */
  async updateStatus(userId, mistakeId, revisionStatus) {
    const mistake = await MistakeBank.findOne({ _id: mistakeId, userId });
    if (!mistake) {
      const err = new Error("Mistake record not found or unauthorized.");
      err.status = 404;
      throw err;
    }

    mistake.revisionStatus = revisionStatus;
    if (revisionStatus === "mastered") {
      mistake.lastReviewedAt = new Date();
    }

    return await mistake.save();
  }

  /**
   * Updates custom revision notes for a mistake.
   */
  async updateNotes(userId, mistakeId, notes) {
    const mistake = await MistakeBank.findOne({ _id: mistakeId, userId });
    if (!mistake) {
      const err = new Error("Mistake record not found or unauthorized.");
      err.status = 404;
      throw err;
    }

    mistake.notes = notes;
    mistake.lastReviewedAt = new Date();
    return await mistake.save();
  }

  /**
   * Deletes a mistake record with ownership verification.
   */
  async deleteMistake(userId, mistakeId) {
    const deleted = await MistakeBank.findOneAndDelete({ _id: mistakeId, userId });
    if (!deleted) {
      const err = new Error("Mistake record not found or unauthorized.");
      err.status = 404;
      throw err;
    }
    return deleted;
  }

  /**
   * Computes summary metrics and breakdown counts.
   */
  async getMistakeStats(userId) {
    const mistakes = await MistakeBank.find({ userId })
      .select("sourceModule revisionStatus")
      .lean();

    const stats = {
      total: mistakes.length,
      unresolved: 0,
      reviewing: 0,
      mastered: 0,
      byModule: {
        quiz: 0,
        aptitude: 0,
        dsa: 0,
        sql: 0,
        interview: 0,
        system_design: 0,
        manual: 0,
      },
    };

    for (const m of mistakes) {
      if (m.revisionStatus === "unresolved") stats.unresolved += 1;
      else if (m.revisionStatus === "reviewing") stats.reviewing += 1;
      else if (m.revisionStatus === "mastered") stats.mastered += 1;

      if (stats.byModule[m.sourceModule] !== undefined) {
        stats.byModule[m.sourceModule] += 1;
      }
    }

    return stats;
  }
}

export default new MistakeBankService();
