import { z } from "zod";

export const startPlacementSchema = z.object({
  targetCompany: z.string().trim().min(1, "Target company is required").max(100).default("Google"),
  targetRole: z.string().trim().min(1, "Target role is required").max(100).default("Software Engineer"),
});

export const submitRoundSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  details: z.record(z.string(), z.any()).optional().default({}),
});

export const placementSessionParamSchema = z.object({
  id: z.string().min(10, "Invalid session ID"),
  roundNum: z.coerce.number().int().min(1).max(4).optional(),
});
