import { z } from "zod";

const slugParamSchema = z.object({
	slug: z.string().trim().min(2).max(120),
});

const codeBodySchema = z.object({
	language: z.enum(["python", "javascript", "cpp", "java"]),
	code: z.string().min(1).max(65536),
});

export const runSampleCodeSchema = {
	params: slugParamSchema,
	body: codeBodySchema.extend({
		customInput: z.string().max(10240).optional(),
	}),
};

export const submitCodeSchema = {
	params: slugParamSchema,
	body: codeBodySchema,
};

export const hintRequestSchema = {
	params: slugParamSchema,
	body: z.object({
		level: z.coerce.number().int().min(1).max(3).default(1),
		currentCode: z.string().max(65536).optional().default(""),
	}),
};

export const historyParamsSchema = {
	params: slugParamSchema,
};
