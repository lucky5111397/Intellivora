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
        console.error("===== GEMINI ERROR =====");

        if (error.status) {
            console.error("Status:", error.status);
        }

        if (error.message) {
            console.error("Message:", error.message);
        }

        if (error.error) {
            console.error("Error:", JSON.stringify(error.error, null, 2));
        }

        console.error(JSON.stringify(error, null, 2));

        throw error;
    }

}