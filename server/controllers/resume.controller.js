import { createUploadResponse } from "../services/resume.service.js";
import { extractTextFromPdf } from "../services/pdfExtractor.service.js";
import { analyzeResumeText } from "../services/resumeAnalysis.service.js";
import User from "../models/user.model.js";

const ATS_CREDIT_COST = 200;

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    const response = createUploadResponse(req.file);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const extractResumeText = async (req, res, next) => {
  try {
    const { uploadId } = req.body;

    const extractedText = await extractTextFromPdf(uploadId);

    return res.status(200).json({
      success: true,
      uploadId,
      extractedText,
      textLength: extractedText.length,
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (req, res, next) => {
  try {
    const { extractedText, targetRole, experienceLevel } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required for ATS Resume Checker.",
      });
    }

    const user = await User.findById(userId).select("credits");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.credits < ATS_CREDIT_COST) {
      return res.status(400).json({
        success: false,
        message: "You need 200 credits to use ATS Resume Checker.",
        credits: user.credits,
      });
    }

    const chargedUser = await User.findOneAndUpdate(
      { _id: userId, credits: { $gte: ATS_CREDIT_COST } },
      { $inc: { credits: -ATS_CREDIT_COST } },
      { new: true }
    );

    if (!chargedUser) {
      return res.status(400).json({
        success: false,
        message: "You need 200 credits to use ATS Resume Checker.",
      });
    }

    try {
      const analysis = await analyzeResumeText({ extractedText, targetRole, experienceLevel });

      return res.status(200).json({
        success: true,
        credits: chargedUser.credits,
        ...analysis,
      });
    } catch (analysisError) {
      try {
        await User.findByIdAndUpdate(userId, { $inc: { credits: ATS_CREDIT_COST } });
      } catch (refundError) {
        console.error("Failed to refund credits after ATS analysis failure:", refundError);
      }
      next(analysisError);
    }
  } catch (error) {
    next(error);
  }
};
