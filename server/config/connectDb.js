import mongoose from "mongoose";
import QuestionBankService from "../services/questionBank.service.js";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ Database Connected");

    // Auto-seed question bank if empty
    QuestionBankService.seedInitialQuestions().catch((err) => {
      console.warn("[Seed] QuestionBank auto-seed notification:", err.message);
    });
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
  }
};

export default connectDb;