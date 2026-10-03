import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import CreditTransaction from "../models/creditTransaction.model.js";

describe("Credit Transaction Ledger & Audit Model", () => {
  const dummyUserId = new mongoose.Types.ObjectId();

  describe("CreditTransaction Mongoose schema structure", () => {
    it("defines required userId referencing User model with index", () => {
      const paths = CreditTransaction.schema.paths;
      assert.ok(paths.userId);
      assert.equal(paths.userId.instance, "ObjectId");
      assert.equal(paths.userId.options.ref, "User");
      assert.equal(paths.userId.options.required, true);
    });

    it("enforces type enum across topup, deduction, refund, welcome_bonus, admin_adjustment", () => {
      const typePath = CreditTransaction.schema.paths.type;
      assert.ok(typePath);
      assert.deepEqual(typePath.enumValues, [
        "topup",
        "deduction",
        "refund",
        "welcome_bonus",
        "admin_adjustment",
      ]);
    });

    it("defines signed amount, balanceBefore, and balanceAfter as required numbers", () => {
      const paths = CreditTransaction.schema.paths;
      assert.ok(paths.amount);
      assert.equal(paths.amount.options.required, true);

      assert.ok(paths.balanceBefore);
      assert.equal(paths.balanceBefore.options.required, true);

      assert.ok(paths.balanceAfter);
      assert.equal(paths.balanceAfter.options.required, true);
    });

    it("defines feature origin, referenceId, and idempotencyKey", () => {
      const paths = CreditTransaction.schema.paths;
      assert.ok(paths.feature);
      assert.ok(paths.referenceId);
      assert.ok(paths.referenceModel);
      assert.ok(paths.description);
      assert.ok(paths.idempotencyKey);
    });

    it("verifies compound indexes for user timeline and idempotency", () => {
      const indexes = CreditTransaction.schema.indexes();
      const hasTimelineIndex = indexes.some(
        ([fields]) => fields.userId === 1 && fields.createdAt === -1
      );
      const hasIdempotencyIndex = indexes.some(
        ([fields, options]) =>
          fields.userId === 1 && fields.idempotencyKey === 1 && options.unique === true
      );

      assert.equal(hasTimelineIndex, true);
      assert.equal(hasIdempotencyIndex, true);
    });
  });

  describe("CreditTransaction Document validation", () => {
    it("validates a complete, compliant deduction transaction document", async () => {
      const doc = new CreditTransaction({
        userId: dummyUserId,
        type: "deduction",
        amount: -150,
        balanceBefore: 500,
        balanceAfter: 350,
        feature: "interview",
        referenceId: "607f1f77bcf86cd799439011",
        referenceModel: "Interview",
        description: "AI Interview (15 questions)",
      });

      await assert.doesNotReject(async () => {
        await doc.validate();
      });
      assert.equal(doc.amount, -150);
      assert.equal(doc.balanceAfter, doc.balanceBefore + doc.amount);
    });

    it("validates a complete, compliant topup transaction document", async () => {
      const doc = new CreditTransaction({
        userId: dummyUserId,
        type: "topup",
        amount: 500,
        balanceBefore: 100,
        balanceAfter: 600,
        feature: "payment",
        referenceId: "order_DBJOWzybf0sJbb",
        referenceModel: "Payment",
        description: "Payment Plan Top-up (Pro)",
        idempotencyKey: "order_DBJOWzybf0sJbb",
      });

      await assert.doesNotReject(async () => {
        await doc.validate();
      });
      assert.equal(doc.amount, 500);
      assert.equal(doc.balanceAfter, doc.balanceBefore + doc.amount);
    });

    it("rejects document missing required financial snapshot fields", async () => {
      const invalidDoc = new CreditTransaction({
        userId: dummyUserId,
        type: "deduction",
        // missing amount, balanceBefore, balanceAfter, feature, description
      });

      await assert.rejects(async () => {
        await invalidDoc.validate();
      });
    });

    it("rejects invalid transaction type enum", async () => {
      const invalidDoc = new CreditTransaction({
        userId: dummyUserId,
        type: "unauthorized_magic_credit",
        amount: 100,
        balanceBefore: 0,
        balanceAfter: 100,
        feature: "payment",
        description: "Hack attempt",
      });

      await assert.rejects(async () => {
        await invalidDoc.validate();
      });
    });
  });
});
