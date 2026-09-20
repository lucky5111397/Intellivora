import mongoose from "mongoose";

/**
 * User Entity Schema
 * Represents candidate and administrator accounts with platform credit balances.
 * Uses sparse unique indexes for email and phone to accommodate multiple authentication providers.
 */
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

    isActive: {
      type: Boolean,
      default: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;