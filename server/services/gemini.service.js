import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const askGemini = async (messages) => {
    try {
        const prompt = messages
            .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
            .join("\n\n");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const text = response.text;

        if (!text || !text.trim()) {
            throw new Error("Gemini returned empty response.");
        }

        return text.trim();
    } catch (error) {
        console.error("[Gemini] Request failed:", error.status || error.message);
        throw error;
    }
};