import { z } from "zod";

export const getQuestionsQuerySchema = z.object({
  contentType: z.enum(["dsa", "coding", "quiz", "sql", "system_design"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.string().trim().max(100).optional(),
  tag: z.string().trim().max(50).optional(),
  company: z.string().trim().max(50).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const questionSlugParamSchema = z.object({
  slug: z.string().trim().min(2).max(120),
});

export const questionQuerySchema = getQuestionsQuerySchema;
export const slugParamSchema = questionSlugParamSchema;
