import NewsletterSubscriber from "../models/newsletterSubscriber.model.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public endpoint to subscribe to the Intellivora newsletter.
 * POST /api/newsletter/subscribe
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail.length === 0 || normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Check for existing subscription to handle duplicates gracefully
    const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed to Intellivora intelligence updates!",
      });
    }

    await NewsletterSubscriber.create({
      email: normalizedEmail,
      source: typeof source === "string" && source.trim() ? source.trim() : "footer",
    });

    return res.status(201).json({
      success: true,
      alreadySubscribed: false,
      message: "Thank you for subscribing to Intellivora intelligence updates!",
    });
  } catch (error) {
    // Handle concurrent duplicate key race condition safely
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed to Intellivora intelligence updates!",
      });
    }

    console.error("[Newsletter Controller] subscribe error:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your subscription. Please try again.",
    });
  }
};

