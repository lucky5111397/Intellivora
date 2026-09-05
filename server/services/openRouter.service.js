import axios from "axios";

const MODELS = [
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-super:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

export const askAI = async (messages) => {
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`===== CALLING OPENROUTER: ${model} =====`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages,
          max_tokens: 3500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 25000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;

      if (content?.trim()) {
        console.log(`✅ ${model} responded successfully`);
        return content;
      }

      throw new Error(`${model} returned an empty response.`);
    } catch (error) {
      lastError = error;

      console.error(`❌ ${model} failed`);
      console.error("Status:", error.response?.status);
      console.error("Message:", error.message);

      console.log("➡️ Trying next free model...");
    }
  }

  throw new Error(
    lastError?.response?.data?.error?.message ||
      "All configured free AI models failed."
  );
};
