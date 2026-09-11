import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    createOrder,
    verifyPayment,
    handleRazorpayWebhook,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);
paymentRouter.post("/webhook", handleRazorpayWebhook);

export default paymentRouter;
