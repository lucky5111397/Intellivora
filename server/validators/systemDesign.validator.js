import { z } from "zod";

export const architecturalNotesValidator = z.object({
  functionalRequirements: z.string().max(10000).optional().default(""),
  nonFunctionalRequirements: z.string().max(10000).optional().default(""),
  estimations: z.string().max(10000).optional().default(""),
  highLevelArchitecture: z.string().max(20000).optional().default(""),
  dataStorage: z.string().max(10000).optional().default(""),
  apiDesign: z.string().max(10000).optional().default(""),
  tradeOffsAndBottlenecks: z.string().max(10000).optional().default(""),
});

export const saveDraftSchema = z.object({
  diagramData: z.any().optional(),
  architecturalNotes: architecturalNotesValidator.optional(),
});

export const evaluateSystemDesignSchema = z.object({
  diagramData: z.any().optional(),
  architecturalNotes: architecturalNotesValidator,
});

export const systemDesignSlugParamSchema = z.object({
  slug: z.string().trim().min(2).max(120),
});
