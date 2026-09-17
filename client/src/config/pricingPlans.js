/**
 * Centralized Client-Side Pricing and Credit Configuration.
 *
 * Single source of truth for display pricing on the Home Page and Pricing Page.
 *
 * IMPORTANT:
 * The backend (server/controllers/payment.controller.js) is the sole authority
 * for payment validation, Razorpay order amounts, and credit issuance.
 * This client configuration reflects authoritative backend plans.
 */

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    priceNumeric: 0,
    credits: 100,
    tagline: "Targeted Rehearsal",
    description: "Introductory credits on registration for exploring AI technical preparation.",
    features: [
      "100 AI credits on account registration",
      "1 Standard AI Voice Interview (100 credits)",
      "Access to Timed Aptitude Practice",
      "Unified Activity History Tracking",
    ],
    ctaText: "Start Free Practice",
    default: true,
  },
  {
    id: "basic",
    name: "Starter Pack",
    price: "₹199",
    priceNumeric: 199,
    credits: 500,
    tagline: "Focused Upskilling",
    description: "Ideal for regular interview practice, aptitude diagnostics, and skill refinement.",
    features: [
      "500 AI credits (no expiration)",
      "Flexible usage across all AI modules",
      "Detailed AI performance analytics",
      "Unlimited history & report retention",
    ],
    ctaText: "Get Starter Pack",
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: "₹499",
    priceNumeric: 499,
    credits: 1500,
    tagline: "Full Recruitment Cycle",
    description: "Comprehensive preparation pack for technical mock interviews, ATS audits, and GD.",
    features: [
      "1500 AI credits (no expiration)",
      "Multi-agent GD simulations & ATS audits",
      "In-depth competency and rubric feedback",
      "Priority AI model response latency",
    ],
    ctaText: "Get Pro Pack",
    badge: "Best Value",
  },
];

export const SERVICE_CREDIT_COSTS = {
  interview: {
    short: 100,
    medium: 150,
    long: 250,
  },
  gd: 150,
  resume: 200,
  aptitude: 0, // Free practice drills for registered users
};

export const NEW_USER_CREDITS = 100;
