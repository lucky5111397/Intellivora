import crypto from "crypto";
import Payment from "../models/payment.model.js";
import razorpay from "../services/razorpay.service.js";
import User from "../models/user.model.js";

// Authoritative plan catalog defined on backend
export const AUTHORITATIVE_PLANS = {
  basic: {
    planId: "basic",
    name: "Starter Pack",
    amount: 199,
    credits: 500,
  },
  pro: {
    planId: "pro",
    name: "Pro Pack",
    amount: 499,
    credits: 1500,
  },
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !AUTHORITATIVE_PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unauthorized plan selected.",
      });
    }

    // Backend-authoritative price and credits
    const plan = AUTHORITATIVE_PLANS[planId];
    const amount = plan.amount;
    const credits = plan.credits;

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId: plan.planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error("[Payment] Order creation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order.",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters.",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("[Payment] RAZORPAY_KEY_SECRET is not configured.");
      return res.status(500).json({
        success: false,
        message: "Payment verification service unavailable.",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Timing-safe signature comparison to prevent timing attack side-channels
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(String(razorpay_signature), "utf8");
    const isSignatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    const existingPayment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    // Enforce user ownership
    if (existingPayment.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Payment does not belong to the authenticated user.",
      });
    }

    // Atomic CAS to prevent double-credit race conditions
    // Only transitions status if not already 'paid'
    const updatedPayment = await Payment.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
        status: { $ne: "paid" },
      },
      {
        $set: {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true }
    );

    // Replay/idempotency protection: if not modified, payment was already paid
    if (!updatedPayment) {
      const currentUser = await User.findById(req.userId);
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        user: currentUser,
        alreadyProcessed: true,
      });
    }

    // Only the single atomic winner increments user credits
    const updatedUser = await User.findByIdAndUpdate(
      updatedPayment.userId,
      {
        $inc: { credits: updatedPayment.credits },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[Payment] Verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify Razorpay payment.",
    });
  }
};

/**
 * Razorpay Webhook Handler for asynchronous server-to-server confirmation.
 * Verifies signature using RAZORPAY_WEBHOOK_SECRET (or RAZORPAY_KEY_SECRET fallback)
 * and atomically credits user accounts for order.paid and payment.captured events.
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.warn("[Razorpay Webhook] Webhook secret not configured.");
      return res.status(500).json({ success: false, message: "Webhook secret not configured." });
    }

    if (!signature) {
      return res.status(400).json({ success: false, message: "Missing webhook signature." });
    }

    const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(String(signature), "utf8");
    const isValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    const event = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const updatedPayment = await Payment.findOneAndUpdate(
          {
            razorpayOrderId: orderId,
            status: { $ne: "paid" },
          },
          {
            $set: {
              status: "paid",
              razorpayPaymentId: paymentId || `webhook_${Date.now()}`,
            },
          },
          { new: true }
        );

        if (updatedPayment) {
          await User.findByIdAndUpdate(updatedPayment.userId, {
            $inc: { credits: updatedPayment.credits },
          });
          console.log(`[Razorpay Webhook] Credited ${updatedPayment.credits} credits for order ${orderId}`);
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("[Razorpay Webhook] Error:", err.message);
    return res.status(500).json({ success: false, message: "Webhook processing error." });
  }
};
