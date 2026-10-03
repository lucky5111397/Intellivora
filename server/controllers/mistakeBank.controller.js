import MistakeBankService from "../services/mistakeBank.service.js";

export const getMistakes = async (req, res, next) => {
  try {
    const result = await MistakeBankService.getUserMistakes(req.userId, req.query);
    return res.status(200).json({
      success: true,
      data: result.mistakes,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recordMistake = async (req, res, next) => {
  try {
    const item = await MistakeBankService.recordMistake(req.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Mistake recorded in Revision Hub.",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMistakeStatus = async (req, res, next) => {
  try {
    const item = await MistakeBankService.updateStatus(
      req.userId,
      req.params.id,
      req.body.revisionStatus
    );
    return res.status(200).json({
      success: true,
      message: "Revision status updated.",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMistakeNotes = async (req, res, next) => {
  try {
    const item = await MistakeBankService.updateNotes(
      req.userId,
      req.params.id,
      req.body.notes
    );
    return res.status(200).json({
      success: true,
      message: "Revision notes saved.",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMistake = async (req, res, next) => {
  try {
    await MistakeBankService.deleteMistake(req.userId, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Mistake item deleted from Revision Hub.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMistakeStats = async (req, res, next) => {
  try {
    const stats = await MistakeBankService.getMistakeStats(req.userId);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
