import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["dsa", "coding", "quiz", "sql", "system_design", "interview"],
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    companies: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    dsaMetadata: {
      starterCode: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      testCases: [
        {
          input: { type: mongoose.Schema.Types.Mixed, required: true },
          expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
          isHidden: { type: Boolean, default: false },
        },
      ],
      hints: {
        type: [String],
        default: [],
      },
      timeLimitMs: {
        type: Number,
        default: 2000,
      },
      memoryLimitMb: {
        type: Number,
        default: 256,
      },
    },
    quizMetadata: {
      options: [
        {
          key: { type: String, required: true },
          text: { type: String, required: true },
        },
      ],
      correctOptionKey: {
        type: String,
        default: "A",
      },
      explanation: {
        type: String,
        default: "",
      },
    },
    sqlMetadata: {
      schemaDdl: {
        type: String,
        default: "",
      },
      seedDataSql: {
        type: String,
        default: "",
      },
      referenceQuery: {
        type: String,
        default: "",
      },
    },
    systemDesignMetadata: {
      requirements: {
        type: [String],
        default: [],
      },
      constraints: {
        type: [String],
        default: [],
      },
      scaleEstimates: {
        type: String,
        default: "",
      },
      expectedComponents: {
        type: [String],
        default: [],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

questionBankSchema.index({ contentType: 1, difficulty: 1, category: 1 });
questionBankSchema.index({ contentType: 1, isActive: 1 });

const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
export default QuestionBank;
