import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { validate } from "../middlewares/validate.js";
import errorHandler from "../middlewares/errorHandler.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/payment.validator.js";
import { updateProfileSchema } from "../validators/userProfile.validator.js";
import { adminCreditUpdateSchema } from "../validators/credit.validator.js";
import {
  runSampleCodeSchema,
  submitCodeSchema,
  hintRequestSchema,
  historyParamsSchema,
} from "../validators/dsa.validator.js";

describe("Input Validation & Zod Middleware", () => {
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };
    return res;
  };

  describe("validate middleware unit behavior", () => {
    it("passes control to next() when request body satisfies schema", async () => {
      const schema = {
        body: z.object({
          name: z.string().min(2),
        }),
      };

      const req = { body: { name: "Alice" } };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = validate(schema);
      await middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.equal(res.statusCode, 200);
      assert.equal(req.body.name, "Alice");
    });

    it("returns HTTP 400 with normalized errors array when validation fails", async () => {
      const schema = {
        body: z.object({
          email: z.string().email(),
          count: z.number().int().min(1),
        }),
      };

      const req = { body: { email: "not-an-email", count: -5 } };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = validate(schema);
      await middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Request validation failed.");
      assert.ok(Array.isArray(res.body.errors));
      assert.equal(res.body.errors.length, 2);

      const fields = res.body.errors.map((e) => e.field);
      assert.ok(fields.includes("email"));
      assert.ok(fields.includes("count"));
    });

    it("coerces and validates query parameters", async () => {
      const schema = {
        query: z.object({
          page: z.coerce.number().int().min(1).default(1),
          limit: z.coerce.number().int().min(1).max(50).default(20),
        }),
      };

      const req = { query: { page: "3", limit: "15" } };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = validate(schema);
      await middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.equal(req.query.page, 3);
      assert.equal(req.query.limit, 15);
    });
  });

  describe("payment.validator schemas", () => {
    it("accepts valid planIds and rejects unauthorized plan tiers", async () => {
      assert.doesNotThrow(() => createOrderSchema.body.parse({ planId: "basic" }));
      assert.doesNotThrow(() => createOrderSchema.body.parse({ planId: "pro" }));

      assert.throws(() => createOrderSchema.body.parse({ planId: "enterprise" }));
      assert.throws(() => createOrderSchema.body.parse({ planId: "free" }));
      assert.throws(() => createOrderSchema.body.parse({}));
    });

    it("validates razorpay payment verification parameters format", async () => {
      const validPayload = {
        razorpay_order_id: "order_DBJOWzybf0sJbb",
        razorpay_payment_id: "pay_29QQoUBcxrhErF",
        razorpay_signature: "9ef4b61e27a7c0fb8d2b2ec9a5db7f516ec5a6bc3f1388eb1a6ebfe382285a7b",
      };

      assert.doesNotThrow(() => verifyPaymentSchema.body.parse(validPayload));

      // Rejects invalid order ID prefix
      assert.throws(() =>
        verifyPaymentSchema.body.parse({
          ...validPayload,
          razorpay_order_id: "invalid_prefix_123",
        })
      );

      // Rejects invalid signature format (not 64-char hex)
      assert.throws(() =>
        verifyPaymentSchema.body.parse({
          ...validPayload,
          razorpay_signature: "too-short-sig",
        })
      );
    });
  });

  describe("userProfile.validator schemas", () => {
    it("validates profile update payload bounds", async () => {
      const validProfile = {
        headline: "Software Engineer",
        bio: "Passionate backend developer with 3 years experience.",
        targetRole: "Full Stack Engineer",
        targetCompanies: ["Google", "Amazon"],
        experienceLevel: "1-3",
        skills: [{ name: "Node.js", category: "Backend", level: "Advanced" }],
        links: {
          github: "https://github.com/developer",
          linkedin: "https://linkedin.com/in/developer",
          portfolio: "https://myportfolio.dev",
        },
      };

      const parsed = updateProfileSchema.body.parse(validProfile);
      assert.equal(parsed.headline, "Software Engineer");
      assert.equal(parsed.skills.length, 1);

      // Rejects oversized headline (> 120 chars)
      assert.throws(() =>
        updateProfileSchema.body.parse({
          headline: "x".repeat(121),
        })
      );

      // Rejects invalid experience enum
      assert.throws(() =>
        updateProfileSchema.body.parse({
          experienceLevel: "10-20-years",
        })
      );

      // Rejects malformed URL in social links
      assert.throws(() =>
        updateProfileSchema.body.parse({
          links: { github: "not-a-url" },
        })
      );
    });
  });

  describe("credit.validator schemas", () => {
    it("enforces mutual requirement of either amount or newCredits", async () => {
      const validByAmount = {
        params: { id: "507f1f77bcf86cd799439011" },
        body: { amount: 150, reason: "Refund for failed interview round" },
      };
      assert.doesNotThrow(() => adminCreditUpdateSchema.body.parse(validByAmount.body));

      const validByNewCredits = {
        params: { id: "507f1f77bcf86cd799439011" },
        body: { newCredits: 1000 },
      };
      assert.doesNotThrow(() => adminCreditUpdateSchema.body.parse(validByNewCredits.body));

      // Rejects empty body with neither amount nor newCredits
      assert.throws(() => adminCreditUpdateSchema.body.parse({ reason: "No amount specified" }));
    });
  });

  describe("dsa.validator schemas", () => {
    it("validates active DSA execution request shapes", () => {
      assert.doesNotThrow(() =>
        runSampleCodeSchema.body.parse({
          language: "python",
          code: "print('hello world')",
        })
      );
      assert.doesNotThrow(() =>
        submitCodeSchema.body.parse({
          language: "javascript",
          code: "console.log('hello world')",
        })
      );
      assert.doesNotThrow(() =>
        hintRequestSchema.body.parse({ level: 1, currentCode: "" })
      );
      assert.doesNotThrow(() =>
        historyParamsSchema.params.parse({ slug: "two-sum" })
      );

      assert.throws(() =>
        runSampleCodeSchema.body.parse({
          language: "ruby",
          code: "puts 'hello'",
        })
      );
      assert.throws(() =>
        submitCodeSchema.body.parse({
          language: "python",
          code: "",
        })
      );
    });
  });

  describe("errorHandler integration with ZodError", () => {
    it("catches ZodError and formats as standard HTTP 400", () => {
      const testSchema = z.object({ id: z.number() });
      let caughtError;
      try {
        testSchema.parse({ id: "invalid" });
      } catch (err) {
        caughtError = err;
      }

      const req = { method: "POST", originalUrl: "/api/test" };
      const res = createMockRes();

      errorHandler(caughtError, req, res, () => {});

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Request validation failed.");
      assert.equal(res.body.errors[0].field, "id");
    });
  });
});
