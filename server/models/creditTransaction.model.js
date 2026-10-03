import mongoose from "mongoose";

/**
 * CreditTransaction Entity Schema
 * Immutable financial audit ledger capturing all credit allocations, feature consumption,
 * compensating refunds, and administrative balances.
 */
const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["topup", "deduction", "refund", "welcome_bonus", "admin_adjustment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Signed integer: positive for additions (+500), negative for deductions (-150)
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    feature: {
      type: String,
      enum: [
        "interview",
        "aptitude",
        "gd",
        "resume",
        "dsa",
        "payment",
        "signup",
        "admin",
      ],
      required: true,
    },
    referenceId: {
      type: String,
      default: null,
      index: true,
    },
    referenceModel: {
      type: String,
      enum: ["Payment", "Interview", "GDSession", "ResumeAnalysis", "User", null],
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["completed", "reversed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

// Fast compound index for user timeline queries & idempotency guarantees
creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);

const CreditTransaction = mongoose.model(
  "CreditTransaction",
  creditTransactionSchema
);
export default CreditTransaction;
