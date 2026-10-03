import { z } from "zod";

export const updateProfileSchema = {
  body: z.object({
    headline: z.string().max(120, "Headline cannot exceed 120 characters.").trim().optional(),
    bio: z.string().max(500, "Bio cannot exceed 500 characters.").trim().optional(),
    targetRole: z.string().max(80, "Target role cannot exceed 80 characters.").trim().optional(),
    targetCompanies: z
      .array(z.string().max(50, "Company name cannot exceed 50 characters.").trim())
      .max(10, "Cannot specify more than 10 target companies.")
      .optional(),
    experienceLevel: z
      .enum(["fresher", "0-1", "1-3", "3-5", "5+", ""], {
        errorMap: () => ({ message: "Invalid experience level selected." }),
      })
      .optional(),
    skills: z
      .array(
        z.object({
          name: z.string().min(1, "Skill name cannot be empty.").max(50, "Skill name too long.").trim(),
          category: z.string().max(50).trim().default("Technical"),
          level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
        })
      )
      .max(50, "Cannot specify more than 50 skills.")
      .optional(),
    education: z
      .array(
        z.object({
          institution: z.string().max(100).trim().optional(),
          degree: z.string().max(100).trim().optional(),
          fieldOfStudy: z.string().max(100).trim().optional(),
          graduationYear: z.number().int().min(1950).max(2050).optional(),
        })
      )
      .max(10, "Cannot specify more than 10 education entries.")
      .optional(),
    links: z
      .object({
        github: z.string().url("Invalid GitHub URL.").or(z.literal("")).optional(),
        linkedin: z.string().url("Invalid LinkedIn URL.").or(z.literal("")).optional(),
        portfolio: z.string().url("Invalid Portfolio URL.").or(z.literal("")).optional(),
      })
      .optional(),
    preferences: z
      .object({
        emailNotifications: z.boolean().optional(),
        jobAlerts: z.boolean().optional(),
        difficultyPreference: z.enum(["adaptive", "entry", "mid", "senior"]).optional(),
      })
      .optional(),
  }),
};

export const userIdParamSchema = {
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format."),
  }),
};
