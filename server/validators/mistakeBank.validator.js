import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createMistakeSchema = z.object({
  sourceModule: z.enum(
    [
      "quiz",
      "dsa",
      "sql",
      "system_design",
      "aptitude",
      "interview",
      "manual",
    ],
    {
      required_error: "sourceModule is required",
      invalid_type_error: "Invalid sourceModule",
    }
  ),
  questionTitle: z
    .string({ required_error: "Question title is required" })
    .trim()
    .min(3, "Question title must be at least 3 characters")
    .max(300, "Question title cannot exceed 300 characters"),
  questionSlug: z.string().trim().optional().default(""),
  questionId: z.string().trim().optional(),
  category: z.string().trim().optional().default("General"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  tags: z.array(z.string().trim()).optional().default([]),
  userAnswer: z.string().trim().optional().default(""),
  expectedAnswer: z.string().trim().optional().default(""),
  explanation: z.string().trim().optional().default(""),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .default(""),
});

export const updateMistakeStatusSchema = z.object({
  revisionStatus: z.enum(["unresolved", "reviewing", "mastered"], {
    error: "Status must be 'unresolved', 'reviewing', or 'mastered'",
  }),
});

export const updateMistakeNotesSchema = z.object({
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .default(""),
});

const validModules = [
  "all",
  "quiz",
  "dsa",
  "sql",
  "system_design",
  "aptitude",
  "interview",
  "manual",
];

const validStatuses = ["all", "unresolved", "reviewing", "mastered"];

export const queryMistakesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sourceModule: z
    .string()
    .trim()
    .transform((value) => (value === "" ? "all" : value))
    .refine((value) => validModules.includes(value), {
      message: "sourceModule must be one of the supported modules or 'all'",
    })
    .default("all"),
  revisionStatus: z
    .string()
    .trim()
    .transform((value) => (value === "" ? "all" : value))
    .refine((value) => validStatuses.includes(value), {
      message: "revisionStatus must be one of 'all', 'unresolved', 'reviewing', or 'mastered'",
    })
    .default("all"),
  search: z.string().trim().default(""),
});

export const mistakeIdParamSchema = z.object({
  id: z
    .string({ required_error: "Mistake ID is required" })
    .regex(objectIdRegex, "Invalid mistake ID format"),
});
