import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    createOrder,
    verifyPayment,
    handleRazorpayWebhook,
} from "../controllers/payment.controller.js";
import { paymentLimiter } from "../middlewares/rateLimiter.js";

const paymentRouter = express.Router();
paymentRouter.use(paymentLimiter);

paymentRouter.post("/order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);
paymentRouter.post("/webhook", handleRazorpayWebhook);

export default paymentRouter;
