import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      required: false,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      required: false,
    },

    credits: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;