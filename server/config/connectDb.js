import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
  }
};

export default connectDb;