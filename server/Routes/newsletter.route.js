import express from "express";
import { subscribeNewsletter } from "../controllers/newsletter.controller.js";
import { newsletterLimiter } from "../middlewares/rateLimiter.js";

const newsletterRouter = express.Router();
newsletterRouter.use(newsletterLimiter);

// Public subscription endpoint
newsletterRouter.post("/subscribe", subscribeNewsletter);

export default newsletterRouter;

