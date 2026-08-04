import { askAI } from "./openRouter.service.js";

const isString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

const parseNumber = (value) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
};

const validateAnalysisResponse = (response) => {
  const requiredFields = [
    "resumeScore",
    "atsScore",
    "interviewReadinessScore",
    "strengths",
    "weaknesses",
    "missingSkills",
    "improvementSuggestions",
    ];

  if (!response || typeof response !== "object") {
    throw new Error("AI analysis response is not a valid JSON object.");
  }

  const resumeScore = parseNumber(response.resumeScore);
  const atsScore = parseNumber(response.atsScore);
  const interviewReadinessScore = parseNumber(response.interviewReadinessScore);

  if (resumeScore === null || atsScore === null || interviewReadinessScore === null) {
    throw new Error("AI analysis response must include numeric score fields.");
  }

  const finalResponse = {
    resumeScore: Math.min(100, Math.max(0, resumeScore)),
    atsScore: Math.min(100, Math.max(0, atsScore)),
    interviewReadinessScore: Math.min(100, Math.max(0, interviewReadinessScore)),
    strengths: normalizeArray(response.strengths),
    weaknesses: normalizeArray(response.weaknesses),
    missingSkills: normalizeArray(response.missingSkills),
    improvementSuggestions: normalizeArray(response.improvementSuggestions),
  };

  requiredFields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(response, field)) {
      throw new Error(`AI analysis response is missing required field: ${field}`);
    }
  });

  return finalResponse;
};

const buildPrompt = ({ extractedText, targetRole, experienceLevel }) => {
  return `You are a professional resume analyst and career coach.
Analyze the following resume text and return JSON only with the exact fields described below.
Do not include any explanation, markdown, or additional keys.

Resume Text:
${extractedText}

Target Role: ${targetRole}
Experience Level: ${experienceLevel}

Return valid JSON with these fields:
{
  "resumeScore": number,                // 0-100, overall resume quality
  "atsScore": number,                   // 0-100, applicant tracking system friendliness
  "interviewReadinessScore": number,    // 0-100, how ready the candidate appears for interview
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSkills": ["string"],
  "improvementSuggestions": ["string"]
}
 
If the resume text is incomplete, make conservative recommendations based only on the provided content.
If a field has no applicable items, return an empty array.
`;
};

export const analyzeResumeText = async ({ extractedText, targetRole, experienceLevel }) => {
  if (!isString(extractedText)) {
    const error = new Error("Extracted text is required and must be a non-empty string.");
    error.status = 400;
    throw error;
  }

  if (!isString(targetRole)) {
    const error = new Error("targetRole is required and must be a non-empty string.");
    error.status = 400;
    throw error;
  }

  if (!isString(experienceLevel)) {
    const error = new Error("experienceLevel is required and must be a non-empty string.");
    error.status = 400;
    throw error;
  }

  const messages = [
    {
      role: "system",
      content: "You are a professional resume analyst and career coach. Return valid JSON only.",
    },
    {
      role: "user",
      content: buildPrompt({ extractedText, targetRole, experienceLevel }),
    },
  ];

  const aiResponse = await askAI(messages);

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(aiResponse);
  } catch (error) {
    const parseError = new Error("AI returned invalid JSON. Analysis response could not be parsed.");
    parseError.status = 502;
    throw parseError;
  }

  try {
    return validateAnalysisResponse(parsedResponse);
  } catch (error) {
    const validationError = new Error(`AI analysis validation failed: ${error.message}`);
    validationError.status = 502;
    throw validationError;
  }
};
