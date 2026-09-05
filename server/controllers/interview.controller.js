import fs from "fs";
import mongoose from "mongoose";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

export const analyzeResume = async (req, res) => {
  const filepath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => item.str)
        .join(" ");

      resumeText += pageText + " ";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `Extract structured data from resume. Return strictly JSON:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAI(messages);
    const cleanedAi = (aiResponse || "")
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```$/im, "")
      .trim();
    const parsed = JSON.parse(cleanedAi);

    return res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText,
    });
  } catch (error) {
    console.error("[Analyze Resume] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze resume.",
    });
  } finally {
    if (filepath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (unlinkErr) {
        console.warn("[Analyze Resume] File unlink warning:", unlinkErr.message);
      }
    }
  }
};

export const generateQuestion = async (req, res) => {
  let questionsArray = [];
  try {
    let {
      role,
      experience,
      mode,
      interviewPlan,
      resumeText,
      projects,
      skills,
    } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    const planConfig = {
      short: { questions: 10, credits: 100 },
      medium: { questions: 15, credits: 150 },
      long: { questions: 25, credits: 250 },
    };

    const selectedPlan = planConfig[interviewPlan] || planConfig.medium;

    if (!role || !experience || !mode) {
      return res.status(400).json({ success: false, message: "Role, Experience, and Mode are required." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.credits < selectedPlan.credits) {
      return res.status(400).json({
        success: false,
        message: `Not enough credits. ${selectedPlan.credits} credits required.`,
      });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

    const messages = [
      {
        role: "system",
        content: `You are a professional human interviewer conducting an interview.
Generate exactly ${selectedPlan.questions} questions, one per line.
Rules:
- Between 15 and 25 words per question.
- Single complete sentence ending with '?'.
- No numbers, no preambles, no explanations.
- Progressive difficulty from easy to medium to hard.`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAI(messages);
    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ success: false, message: "AI returned empty response." });
    }

    questionsArray = aiResponse
      .split("\n")
      .map((q) =>
        q
          .replace(/^\d+[\).\-\s]*/, "")
          .replace(/^[*-]\s*/, "")
          .replace(/^"+|"+$/g, "")
          .trim()
      )
      .filter((q) => q.length > 10 && q.endsWith("?"))
      .slice(0, selectedPlan.questions);

    if (questionsArray.length === 0) {
      return res.status(500).json({ success: false, message: "AI failed to generate valid questions." });
    }

    user.credits -= selectedPlan.credits;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      interviewPlan,
      questionCount: selectedPlan.questions,
      creditsUsed: selectedPlan.credits,
      questions: questionsArray.map((q, index) => {
        let difficulty = "hard";
        let timeLimit = 120;

        if (index < Math.ceil(selectedPlan.questions * 0.4)) {
          difficulty = "easy";
          timeLimit = 60;
        } else if (index < Math.ceil(selectedPlan.questions * 0.8)) {
          difficulty = "medium";
          timeLimit = 90;
        }

        return {
          question: q,
          difficulty,
          timeLimit,
        };
      }),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    console.error("[Interview] generateQuestion error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate interview questions.",
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ success: false, message: "Invalid question index." });
    }

    const question = interview.questions[questionIndex];

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `You are a professional human interviewer evaluating a candidate's answer.
Score 0 to 10 for confidence, communication, correctness.
finalScore = average rounded to nearest whole number.
feedback = 10 to 15 natural words.
Return ONLY valid JSON:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}`,
      },
      {
        role: "user",
        content: `Question: ${question.question}\nAnswer: ${answer}`,
      },
    ];

    const aiResponse = await askAI(messages);
    const cleanedAi = (aiResponse || "")
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```$/im, "")
      .trim();
    const parsed = JSON.parse(cleanedAi);

    question.answer = answer;
    question.confidence = parsed.confidence || 0;
    question.communication = parsed.communication || 0;
    question.correctness = parsed.correctness || 0;
    question.score = parsed.finalScore || 0;
    question.feedback = parsed.feedback || "Answer evaluated.";

    await interview.save();
    return res.status(200).json({ feedback: question.feedback });
  } catch (error) {
    console.error("[Interview] submitAnswer error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to submit answer." });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const totalQuestions = interview.questions.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "Completed";
    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    console.error("[Interview] finishInterview error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to finish interview." });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    console.error("[Interview] getMyInterviews error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch interviews." });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const totalQuestions = interview.questions.length;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    console.error("[Interview] getInterviewReport error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch interview report." });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const interview = await Interview.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    return res.status(200).json({ success: true, message: "Interview deleted successfully." });
  } catch (error) {
    console.error("[Interview] deleteInterview error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete interview." });
  }
};
