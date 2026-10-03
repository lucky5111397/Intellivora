import { z } from "zod";

export const createOrderSchema = {
  body: z.object({
    planId: z.enum(["basic", "pro"], {
      errorMap: () => ({ message: "Invalid or unauthorized plan selected." }),
    }),
  }),
};

export const verifyPaymentSchema = {
  body: z.object({
    razorpay_order_id: z
      .string()
      .trim()
      .min(1, "Order ID is required.")
      .regex(/^order_[a-zA-Z0-9]+$/, "Invalid Razorpay order ID format."),
    razorpay_payment_id: z
      .string()
      .trim()
      .min(1, "Payment ID is required.")
      .regex(/^pay_[a-zA-Z0-9]+$/, "Invalid Razorpay payment ID format."),
    razorpay_signature: z
      .string()
      .trim()
      .min(1, "Signature is required.")
      .regex(/^[a-fA-F0-9]{64}$/, "Invalid Razorpay signature format."),
  }),
};
