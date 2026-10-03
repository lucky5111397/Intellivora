import { z } from "zod";

export const startQuizSchema = z.object({
  category: z.string().min(1, "Category is required."),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  durationMinutes: z.coerce.number().int().min(5).max(60).default(15),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1, "Question ID is required."),
      selectedOptionKey: z.string().nullable().optional(),
    })
  ),
  timeTakenSeconds: z.coerce.number().int().min(0).default(0),
});
