import QuestionBankService from "../services/questionBank.service.js";

export const getQuestions = async (req, res) => {
  try {
    const result = await QuestionBankService.listQuestions(req.query);
    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[QuestionBank Controller] getQuestions error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve questions." });
  }
};

export const getQuestionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const question = await QuestionBankService.getQuestionBySlug(slug, false);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found or inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("[QuestionBank Controller] getQuestionBySlug error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve question details." });
  }
};

export const getQuestionCategories = async (req, res) => {
  try {
    const { contentType } = req.query;
    const categories = await QuestionBankService.getCategories(contentType);
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("[QuestionBank Controller] getQuestionCategories error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve question categories." });
  }
};
