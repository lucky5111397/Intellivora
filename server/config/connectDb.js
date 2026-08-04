import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ Database Connected");
    console.log(conn.connection.host);
  } catch (error) {
    console.log("❌ Database Error:", error.message);
  }
};

export default connectDb;