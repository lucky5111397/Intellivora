import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
export const analyzeResume = async (req, res) => {
  try {
    console.log("req.file:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "Resume required",
      });
    }

    const filepath = req.file.path;
    console.log("filepath:", filepath);

    const fileBuffer = await fs.promises.readFile(filepath);
    console.log("File Read Success");

    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    console.log("PDF Loaded");

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

    console.log("Resume Text:", resumeText);

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAI(messages);

    console.log("AI Response:", aiResponse);

    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath);

    return res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText,
    });
  } catch (error) {
    console.error("Analyze Resume Error:", error);
    console.error(error.stack);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// Generate AI Interview Questions
export const generateQuestion = async (req, res) => {
  try {
    console.log("===== GENERATE QUESTION HIT =====");
    console.log(req.body);

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
      short: {
        questions: 10,
        credits: 100,
      },
      medium: {
        questions: 15,
        credits: 150,
      },
      long: {
        questions: 25,
        credits: 250,
      },
    };

    const selectedPlan =
      planConfig[interviewPlan] || planConfig.medium;
    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and MOde are required." })
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    console.log("req.userId:", req.userId);
    console.log("DB Credits:", user.credits);

    if (user.credits < selectedPlan.credits) {
      return res.status(400).json({
        message: `Not enough credits. ${selectedPlan.credits} credits required.`,
      });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(",")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length ? skills.join(",")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;
    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty."
      })
    }
    const messages = [

      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly ${selectedPlan.questions} interview questions.

IMPORTANT:
You MUST generate exactly ${selectedPlan.questions} questions.

If the requested count is 25, return exactly 25 questions.
If the requested count is 15, return exactly 15 questions.
If the requested count is 10, return exactly 10 questions.

Do NOT stop after 5 questions.
Do NOT summarize.
Do NOT skip any questions.
Return ONLY the questions, one per line.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.


Difficulty progression:

Question 1 → easy
Question 2 → easy
Question 3 → medium
Question 4 → medium
Question 5 → hard

Make questions based on the candidate's role, experience, interviewMode, projects, skills,
and resume details.
`
      }
      ,

      {
        role: "user",
        content: userPrompt,
      }

    ];

    const aiResponse = await askAI(messages);
    console.log("===== AI RESPONSE =====");
    console.log(aiResponse);
    console.log("AI Response:", aiResponse);
    console.log("========== DEBUG ==========");
    console.log("Interview Plan:", interviewPlan);
    console.log("Selected Plan:", selectedPlan);
    console.log("Raw AI Response:\n", aiResponse);
    console.log("===========================");
    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) =>
        q
          .replace(/^\d+[\).\-\s]*/, "")     // 1.  1) 1-
          .replace(/^[*-]\s*/, "")           // - or *
          .replace(/^"+|"+$/g, "")           // remove quotes
          .trim()
      )
      .filter(
        (q) =>
          q.length > 10 &&
          q.endsWith("?")
      )
      .slice(0, selectedPlan.questions);

    console.log("Parsed Questions:", questionsArray);
    console.log("Questions Count:", questionsArray.length);
    console.log(questionsArray);
    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate questions.",
      });
    }

    user.credits -= selectedPlan.credits;
    await user.save();
    console.log("===== QUESTIONS ARRAY =====");
    console.log(questionsArray);

    console.log("===== USER =====");
    console.log(user);

    console.log("===== CREATING INTERVIEW =====");

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

    console.log("===== INTERVIEW CREATED =====");
    console.log(interview);

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    console.log("Questions Array:", questionsArray);
    console.log("Questions Length:", questionsArray.length);
    console.error("===== GENERATE QUESTION ERROR =====");
    console.error(error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
}

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const question = interview.questions[questionIndex]

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();
      return res.json({
        feedback: question.feedback
      });
    }


    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well...
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness
(nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      },
      {
        role: "user",
        content: `Question: ${question.question}
Answer: ${answer}`,
      }
    ];

    const aiResponse = await askAI(messages);

    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback })
  } catch (error) {
    return res.status(500).json({ message: 'failed to submit answer $(error)' })
  }

}


export const finishInterview = async (req, res) => {
  try {
    console.log("===== FINISH INTERVIEW =====");
    console.log(req.body);

    const { interviewId } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    console.log("Interview Found:", interview);


    if (!interview) {
      return res
        .status(400)
        .json({ message: "failed to find Interview" });
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

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

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
    console.error("===== FINISH INTERVIEW ERROR =====");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      message: error.message,
    });
  }
}

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" })
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
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    })
  } catch (error) {
    return res.status(500).json({ message: 'failed to find currentUser Interview Report ${error}' })
  }
}

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    await Interview.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
