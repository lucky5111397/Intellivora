import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import NewsletterSubscriber from "../models/newsletterSubscriber.model.js";
import { subscribeNewsletter } from "../controllers/newsletter.controller.js";
import {
  getAllSubscribers,
  deleteSubscriber,
} from "../controllers/admin.controller.js";

describe("Newsletter System & Admin Operations", () => {
  // =========================================================================
  // 1. NewsletterSubscriber Model Validation
  // =========================================================================
  describe("NewsletterSubscriber Model Schema", () => {
    it("should validate a properly structured subscriber", () => {
      const sub = new NewsletterSubscriber({
        email: "candidate@example.com",
        source: "footer",
      });

      const err = sub.validateSync();
      assert.equal(err, undefined);
      assert.equal(sub.email, "candidate@example.com");
      assert.equal(sub.source, "footer");
      assert.ok(sub.subscribedAt instanceof Date);
    });

    it("should lowercase and trim email address", () => {
      const sub = new NewsletterSubscriber({
        email: "  STUDENT@University.EDU  ",
      });

      assert.equal(sub.email, "student@university.edu");
    });

    it("should reject missing email", () => {
      const sub = new NewsletterSubscriber({});
      const err = sub.validateSync();
      assert.ok(err);
      assert.ok(err.errors.email);
    });

    it("should reject malformed email address", () => {
      const invalidEmails = ["invalid", "test@", "@example.com", "user@site", "name @domain.com"];
      for (const email of invalidEmails) {
        const sub = new NewsletterSubscriber({ email });
        const err = sub.validateSync();
        assert.ok(err, `Expected validation error for ${email}`);
        assert.ok(err.errors.email);
      }
    });
  });

  // =========================================================================
  // 2. Public Subscribe Controller (POST /api/newsletter/subscribe)
  // =========================================================================
  describe("subscribeNewsletter Controller", () => {
    it("should reject missing or empty email with 400", async () => {
      let statusCode = null;
      let responseBody = null;

      const req = { body: {} };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await subscribeNewsletter(req, res);

      assert.equal(statusCode, 400);
      assert.equal(responseBody.success, false);
      assert.equal(responseBody.message, "Email address is required.");
    });

    it("should reject invalid email format with 400", async () => {
      let statusCode = null;
      let responseBody = null;

      const req = { body: { email: "not-an-email" } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await subscribeNewsletter(req, res);

      assert.equal(statusCode, 400);
      assert.equal(responseBody.success, false);
      assert.equal(responseBody.message, "Please provide a valid email address.");
    });

    it("should return friendly 200 response when email is already subscribed", async () => {
      const findOneMock = mock.method(NewsletterSubscriber, "findOne", async () => ({
        _id: new mongoose.Types.ObjectId(),
        email: "existing@example.com",
        subscribedAt: new Date(),
      }));

      let statusCode = null;
      let responseBody = null;

      const req = { body: { email: "existing@example.com" } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await subscribeNewsletter(req, res);

      findOneMock.mock.restore();

      assert.equal(statusCode, 200);
      assert.equal(responseBody.success, true);
      assert.equal(responseBody.alreadySubscribed, true);
      assert.equal(
        responseBody.message,
        "You're already subscribed to Intellivora intelligence updates!"
      );
    });

    it("should create new subscriber and return 201 on first subscription", async () => {
      const findOneMock = mock.method(NewsletterSubscriber, "findOne", async () => null);
      const createMock = mock.method(NewsletterSubscriber, "create", async (doc) => ({
        _id: new mongoose.Types.ObjectId(),
        ...doc,
      }));

      let statusCode = null;
      let responseBody = null;

      const req = { body: { email: "newuser@example.com", source: "footer" } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await subscribeNewsletter(req, res);

      findOneMock.mock.restore();
      createMock.mock.restore();

      assert.equal(statusCode, 201);
      assert.equal(responseBody.success, true);
      assert.equal(responseBody.alreadySubscribed, false);
      assert.equal(
        responseBody.message,
        "Thank you for subscribing to Intellivora intelligence updates!"
      );
    });
  });

  // =========================================================================
  // 3. Admin Controller (GET /api/admin/newsletter)
  // =========================================================================
  describe("getAllSubscribers Controller", () => {
    it("should return paginated subscriber directory", async () => {
      const mockSubscribers = [
        {
          _id: new mongoose.Types.ObjectId(),
          email: "sub1@example.com",
          source: "footer",
          subscribedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          email: "sub2@example.com",
          source: "footer",
          subscribedAt: new Date(),
        },
      ];

      const countDocumentsMock = mock.method(
        NewsletterSubscriber,
        "countDocuments",
        async () => 2
      );
      const findMock = mock.method(NewsletterSubscriber, "find", () => ({
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => mockSubscribers,
              }),
            }),
          }),
        }),
      }));

      let statusCode = null;
      let responseBody = null;

      const req = { query: { page: "1", limit: "20" } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await getAllSubscribers(req, res);

      countDocumentsMock.mock.restore();
      findMock.mock.restore();

      assert.equal(statusCode, 200);
      assert.equal(responseBody.success, true);
      assert.equal(responseBody.subscribers.length, 2);
      assert.equal(responseBody.pagination.totalSubscribers, 2);
      assert.equal(responseBody.pagination.currentPage, 1);
    });
  });

  // =========================================================================
  // 4. Admin Delete Controller (DELETE /api/admin/newsletter/:id)
  // =========================================================================
  describe("deleteSubscriber Controller", () => {
    it("should reject invalid ObjectId with 400", async () => {
      let statusCode = null;
      let responseBody = null;

      const req = { params: { id: "invalid-id" } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await deleteSubscriber(req, res);

      assert.equal(statusCode, 400);
      assert.equal(responseBody.success, false);
      assert.equal(responseBody.message, "Invalid subscriber ID format.");
    });

    it("should return 404 when subscriber to delete is not found", async () => {
      const deleteMock = mock.method(
        NewsletterSubscriber,
        "findByIdAndDelete",
        async () => null
      );

      let statusCode = null;
      let responseBody = null;

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await deleteSubscriber(req, res);

      deleteMock.mock.restore();

      assert.equal(statusCode, 404);
      assert.equal(responseBody.success, false);
      assert.equal(responseBody.message, "Subscriber not found.");
    });

    it("should successfully delete subscriber with 200", async () => {
      const deleteMock = mock.method(
        NewsletterSubscriber,
        "findByIdAndDelete",
        async (id) => ({ _id: id, email: "removed@example.com" })
      );

      let statusCode = null;
      let responseBody = null;

      const validId = new mongoose.Types.ObjectId().toString();
      const req = { params: { id: validId } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseBody = data;
          return this;
        },
      };

      await deleteSubscriber(req, res);

      deleteMock.mock.restore();

      assert.equal(statusCode, 200);
      assert.equal(responseBody.success, true);
      assert.equal(responseBody.message, "Subscriber removed successfully.");
    });
  });
});
