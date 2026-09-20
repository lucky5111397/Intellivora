import mongoose from "mongoose";

/**
 * Newsletter Subscriber Schema
 * Persists email addresses captured from the marketing footer and other signup surfaces.
 */
const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: "footer",
      trim: true,
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ subscribedAt: -1 });

const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);

export default NewsletterSubscriber;
