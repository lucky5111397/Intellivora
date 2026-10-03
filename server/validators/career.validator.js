import { z } from "zod";

export const analyzeJdSchema = z.object({
  jobDescription: z.string().trim().min(30, "Job description must be at least 30 characters long").max(15000),
  resumeText: z.string().trim().max(20000).optional(),
});

export const generateRoadmapSchema = z.object({
  targetRole: z.string().trim().min(2, "Target role is required").max(100),
  currentSkillLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  targetTimelineWeeks: z.coerce.number().int().min(2).max(24).default(8),
  weeklyCommitmentHours: z.coerce.number().int().min(2).max(40).default(10),
});

export const updateMilestoneSchema = z.object({
  milestoneId: z.string().min(1, "Milestone ID is required"),
  completed: z.boolean(),
});

export const createJobApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company name is required").max(100),
  role: z.string().trim().min(1, "Role is required").max(100),
  location: z.string().trim().max(100).optional().default("Remote"),
  salaryRange: z.string().trim().max(100).optional().default(""),
  status: z.enum(["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"]).default("Wishlist"),
  jobUrl: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  appliedDate: z.coerce.date().optional().nullable(),
  interviewDate: z.coerce.date().optional().nullable(),
  matchScore: z.coerce.number().min(0).max(100).optional().nullable(),
});

export const updateJobApplicationSchema = createJobApplicationSchema.partial();
