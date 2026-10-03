import mongoose from "mongoose";

const problemSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionBank",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["python", "javascript", "cpp", "java", "sql"],
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "ACCEPTED",
        "WRONG_ANSWER",
        "TIME_LIMIT_EXCEEDED",
        "MEMORY_LIMIT_EXCEEDED",
        "RUNTIME_ERROR",
        "COMPILE_ERROR",
      ],
      index: true,
    },
    passedTestCases: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
      min: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    memoryKb: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    failedTestCase: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

problemSubmissionSchema.index({ userId: 1, slug: 1, createdAt: -1 });
problemSubmissionSchema.index({ userId: 1, status: 1 });

const ProblemSubmission = mongoose.model("ProblemSubmission", problemSubmissionSchema);
export default ProblemSubmission;
