import { ZodError } from "zod";

/**
 * Express middleware for schema validation using Zod.
 * Validates req.body, req.query, and/or req.params against provided schemas.
 * Replaces request objects with parsed, coerced, and sanitized data.
 *
 * @param {Object} schemas
 * @param {import("zod").ZodTypeAny} [schemas.body]
 * @param {import("zod").ZodTypeAny} [schemas.query]
 * @param {import("zod").ZodTypeAny} [schemas.params]
 * @returns {import("express").RequestHandler}
 */
export const validate = (schemas = {}) => async (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = await schemas.body.parseAsync(req.body);
    }
    if (schemas.query) {
      req.query = await schemas.query.parseAsync(req.query);
    }
    if (schemas.params) {
      req.params = await schemas.params.parseAsync(req.params);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Request validation failed.",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          rule: issue.code,
        })),
      });
    }
    next(error);
  }
};

export default validate;
