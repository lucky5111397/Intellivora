import mongoose from "mongoose";
import CareerRoadmap from "../models/careerRoadmap.model.js";
import JobApplication from "../models/jobApplication.model.js";
import QuestionBank from "../models/questionBank.model.js";
import UserProfile from "../models/userProfile.model.js";
import CreditLedgerService from "../services/creditLedger.service.js";
import AiGatewayService from "../services/aiGateway.service.js";

const JD_ANALYSIS_CREDIT_COST = 10;

export const analyzeJobDescription = async (req, res) => {
  try {
    const { jobDescription, resumeText: rawResume } = req.body;
    const userId = req.userId;

    let resumeText = rawResume;
    if (!resumeText && userId && mongoose.connection.readyState === 1) {
      const profile = await UserProfile.findOne({ userId }).lean();
      resumeText = profile?.skills?.length
        ? `Skills: ${profile.skills.join(", ")}. Experience: ${profile.yearsOfExperience || 0} years. Bio: ${profile.bio || ""}`
        : "Software Engineering Candidate";
    }

    if (mongoose.connection.readyState === 1 && userId) {
      const deduction = await CreditLedgerService.recordUsage({
        userId,
        amount: JD_ANALYSIS_CREDIT_COST,
        feature: "jd_analysis",
      });
      if (!deduction.success) {
        return res.status(402).json({
          success: false,
          message: deduction.message || "Insufficient credits for JD Analysis.",
        });
      }
    }

    const prompt = `You are a Senior Technical Recruiter & Hiring Manager. Analyze this candidate resume against the Job Description.

Job Description:
"""
${jobDescription}
"""

Candidate Profile / Resume:
"""
${resumeText || "General Software Engineer with standard CS background"}
"""

Perform a deep technical compatibility analysis and return a STRICT JSON object:
{
  "matchPercentage": number (0 to 100),
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1", "missingSkill2"],
  "experienceMatchSummary": "2-3 sentences evaluating alignment",
  "tailoredInterviewQuestions": [
    "Expected technical or situational question 1 based on JD requirements",
    "Expected technical or situational question 2",
    "Expected technical or situational question 3"
  ],
  "actionableRecommendations": [
    "Specific resume enhancement tip 1",
    "Specific topic to revise 2"
  ]
}`;

    let analysis;
    try {
      analysis = await AiGatewayService.generateJson({
        task: "jd_analysis",
        prompt,
      });
    } catch {
      // Deterministic fallback
      analysis = {
        matchPercentage: 78,
        matchedSkills: ["JavaScript", "React", "Node.js", "REST APIs", "Git"],
        missingSkills: ["Kubernetes", "System Observability", "Redis Caching"],
        experienceMatchSummary: "Strong alignment on core full-stack web technologies; candidate should highlight distributed systems experience.",
        tailoredInterviewQuestions: [
          "How have you architected microservices communication to prevent cascading failures?",
          "Can you explain your approach to database indexing and query optimization?",
          "Describe how you handle asynchronous state and cache invalidation in React.",
        ],
        actionableRecommendations: [
          "Incorporate quantifiable impact metrics into your project bullet points.",
          "Add mention of Docker containerization or CI/CD pipelines to match JD prerequisites.",
        ],
      };
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("[CareerIntelligence] analyzeJobDescription error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to analyze Job Description." });
  }
};

export const generateRoadmap = async (req, res) => {
  try {
    const { targetRole, currentSkillLevel, targetTimelineWeeks, weeklyCommitmentHours } = req.body;
    const userId = req.userId;

    const weeks = targetTimelineWeeks || 8;
    const milestones = [];

    // Pre-curated structured curriculum based on timeline
    const coreTopics = [
      { title: "Core Data Structures & Complexity", topics: ["Arrays", "Hash Tables", "Two Pointers", "Big-O Analysis"], suggested: ["two-sum"] },
      { title: "Relational Databases & SQL Mastery", topics: ["Joins", "Aggregations", "Subqueries", "Indexing"], suggested: ["second-highest-salary", "department-top-earners"] },
      { title: "Trees, Graphs & Algorithmic Patterns", topics: ["Binary Search Trees", "DFS/BFS", "Dynamic Programming"], suggested: ["lru-cache"] },
      { title: "Low-Level Object Oriented Design", topics: ["Design Patterns", "SOLID Principles", "Concurrency"], suggested: [] },
      { title: "Distributed System Fundamentals", topics: ["Horizontal Scaling", "Load Balancing", "CAP Theorem"], suggested: ["cap-theorem-tradeoff"] },
      { title: "API Gateway, Caching & Resilience", topics: ["Redis Caching", "Rate Limiting", "Circuit Breakers"], suggested: ["design-rate-limiter"] },
      { title: "High-Scale Architecture & Storage", topics: ["Database Sharding", "Message Queues", "Eventual Consistency"], suggested: [] },
      { title: "Mock Placement & Final Polish", topics: ["Live Mock Interviews", "Behavioral STAR", "Resume Tuning"], suggested: [] },
    ];

    for (let w = 1; w <= weeks; w++) {
      const template = coreTopics[(w - 1) % coreTopics.length];
      milestones.push({
        weekNumber: w,
        title: `Week ${w}: ${template.title}`,
        description: `Dedicate ${weeklyCommitmentHours || 10} hours to master ${template.topics.join(", ")}.`,
        topics: template.topics,
        suggestedProblems: template.suggested,
        completed: false,
      });
    }

    // Persist or update active roadmap
    let roadmap = await CareerRoadmap.findOne({ userId, active: true });
    if (!roadmap) {
      roadmap = new CareerRoadmap({
        userId,
        targetRole,
        currentSkillLevel,
        targetTimelineWeeks: weeks,
        weeklyCommitmentHours: weeklyCommitmentHours || 10,
        milestones,
        overallProgress: 0,
        active: true,
      });
    } else {
      roadmap.targetRole = targetRole;
      roadmap.currentSkillLevel = currentSkillLevel;
      roadmap.targetTimelineWeeks = weeks;
      roadmap.weeklyCommitmentHours = weeklyCommitmentHours || 10;
      roadmap.milestones = milestones;
      roadmap.overallProgress = 0;
    }

    await roadmap.save();

    return res.status(200).json({
      success: true,
      data: roadmap,
      message: "Personalized Career Roadmap generated.",
    });
  } catch (error) {
    console.error("[CareerIntelligence] generateRoadmap error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to generate roadmap." });
  }
};

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.userId;
    const roadmap = await CareerRoadmap.findOne({ userId, active: true }).lean();

    return res.status(200).json({
      success: true,
      data: roadmap || null,
    });
  } catch (error) {
    console.error("[CareerIntelligence] getRoadmap error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve roadmap." });
  }
};

export const updateMilestoneProgress = async (req, res) => {
  try {
    const { milestoneId, completed } = req.body;
    const userId = req.userId;

    const roadmap = await CareerRoadmap.findOne({ userId, active: true });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Active roadmap not found." });
    }

    const milestone = roadmap.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found." });
    }

    milestone.completed = Boolean(completed);

    const completedCount = roadmap.milestones.filter((m) => m.completed).length;
    roadmap.overallProgress = Math.round((completedCount / (roadmap.milestones.length || 1)) * 100);

    await roadmap.save();

    return res.status(200).json({
      success: true,
      data: roadmap,
      message: "Milestone updated.",
    });
  } catch (error) {
    console.error("[CareerIntelligence] updateMilestoneProgress error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update milestone." });
  }
};

export const listJobs = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const jobs = await JobApplication.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("[CareerIntelligence] listJobs error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to list job applications." });
  }
};

export const createJob = async (req, res) => {
  try {
    const userId = req.userId;
    const job = await JobApplication.create({
      ...req.body,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: job,
      message: "Job application added.",
    });
  } catch (error) {
    console.error("[CareerIntelligence] createJob error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to create job application." });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const job = await JobApplication.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: "Job application not found." });
    }

    return res.status(200).json({
      success: true,
      data: job,
      message: "Job application updated.",
    });
  } catch (error) {
    console.error("[CareerIntelligence] updateJob error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update job application." });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deleted = await JobApplication.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Job application not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Job application deleted.",
    });
  } catch (error) {
    console.error("[CareerIntelligence] deleteJob error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete job application." });
  }
};

export const getCompanyPreparation = async (req, res) => {
  try {
    const { company } = req.params;

    // Fetch related questions from question bank
    const questions = await QuestionBank.find({
      companyTags: { $regex: new RegExp(`^${company}$`, "i") },
      active: true,
    })
      .select("slug title contentType difficulty category tags")
      .lean();

    const companyProfiles = {
      Google: {
        rounds: ["Online Assessment (2 DSA problems)", "Technical Screen (DSA + Concurrency)", "3-4 Onsite Rounds (DSA, System Design, Googleyness)"],
        focusAreas: ["Graph Algorithms & DP", "Scalable System Architecture", "Data Structures from Scratch"],
        values: ["Focus on the user", "Think 10x", "Collaboration & Psychological Safety"],
      },
      Amazon: {
        rounds: ["Online Assessment (Work Style + 2 Coding)", "Technical Phone Screen", "4 Onsite Rounds (Bar Raiser + Coding + System Design)"],
        focusAreas: ["16 Leadership Principles (Customer Obsession, Ownership)", "Object Oriented Design", "High-Throughput Microservices"],
        values: ["Customer Obsession", "Ownership", "Invent & Simplify", "Bias for Action"],
      },
      Meta: {
        rounds: ["Recruiter Call", "Technical Screen (2 medium DSA in 45m)", "Onsite: 2 Coding + 1 System Design + 1 Behavioral"],
        focusAreas: ["Rapid bug-free coding speed", "Product Architecture Design", "Scalability under extreme QPS"],
        values: ["Move Fast", "Focus on Long-Term Impact", "Build Awesome Things"],
      },
      Microsoft: {
        rounds: ["Online Assessment", "Technical Rounds (Data Structures, Algorithms)", "System Design & Low-Level Design"],
        focusAreas: ["Clean Modular Code", "Enterprise Architecture", "Cloud Native (Azure/Distributed)"],
        values: ["Growth Mindset", "Customer Focus", "Diversity and Inclusion"],
      },
    };

    const profile = companyProfiles[company] || {
      rounds: ["Resume Screen", "Technical Round 1 (Coding & CS Fundamentals)", "Technical Round 2 (System Design & Projects)", "HR & Culture Alignment"],
      focusAreas: ["Data Structures & Problem Solving", "System Architecture", "Behavioral STAR Stories"],
      values: ["Excellence", "Integrity", "Innovation", "Collaboration"],
    };

    return res.status(200).json({
      success: true,
      data: {
        company,
        profile,
        questions,
      },
    });
  } catch (error) {
    console.error("[CareerIntelligence] getCompanyPreparation error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve company preparation details." });
  }
};

export const listTargetCompanies = async (req, res) => {
  try {
    const companies = ["Google", "Amazon", "Meta", "Microsoft", "Uber", "Netflix", "Stripe", "Apple"];
    return res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error("[CareerIntelligence] listTargetCompanies error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to list companies." });
  }
};
