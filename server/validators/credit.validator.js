import { z } from "zod";

export const adminCreditUpdateSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format."),
  }),
  body: z
    .object({
      amount: z
        .number({ invalid_type_error: "Amount must be a number." })
        .int("Amount must be an integer.")
        .min(-50000, "Amount cannot deduct more than 50,000 credits at once.")
        .max(50000, "Amount cannot add more than 50,000 credits at once.")
        .optional(),
      newCredits: z
        .number({ invalid_type_error: "New credits must be a number." })
        .int("New credits must be an integer.")
        .min(0, "New credits balance cannot be negative.")
        .max(500000, "New credits cannot exceed 500,000.")
        .optional(),
      reason: z
        .string()
        .trim()
        .min(3, "Reason must be at least 3 characters.")
        .max(200, "Reason cannot exceed 200 characters.")
        .optional()
        .default("Admin manual adjustment"),
    })
    .refine(
      (data) => data.amount !== undefined || data.newCredits !== undefined,
      {
        message: "Either 'amount' (relative change) or 'newCredits' (absolute balance) must be provided.",
      }
    ),
};

export const paginationQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};
