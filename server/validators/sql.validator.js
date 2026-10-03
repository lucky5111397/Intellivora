import { z } from "zod";

export const executeSqlSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "SQL query cannot be empty")
    .max(5000, "SQL query exceeds maximum size of 5KB"),
});

export const sqlSlugParamSchema = z.object({
  slug: z.string().trim().min(2).max(120),
});
