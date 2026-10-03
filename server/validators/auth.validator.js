import { z } from "zod";

export const googleAuthSchema = {
  body: z.object({
    idToken: z.string().min(1, "Google ID token is required."),
  }),
};

export const phoneAuthSchema = {
  body: z.object({
    idToken: z.string().min(1, "Phone ID token is required."),
  }),
};
