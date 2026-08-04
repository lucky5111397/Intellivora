import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const response = await ai.models.generateContent({
    model: "models/gemini-2.5-flash",
    contents: "Say hello",
  });

  console.log(response.text);
} catch (err) {
  console.log(JSON.stringify(err, null, 2));
}