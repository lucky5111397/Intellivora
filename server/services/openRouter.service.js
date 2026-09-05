import axios from "axios";

export const askAI = async (messages) => {
  try {
    console.log("===== CALLING OPENROUTER =====");
    console.log("API KEY:", process.env.OPENROUTER_API_KEY);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
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
    if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }
    return content
    return content;
  } catch (error) {
    console.error("========== OPENROUTER ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    console.error("[OpenRouter] Request failed:", error.response?.status, error.message);
    console.error("[OpenRouter] Request failed:", error.response?.status || 500, error.message);
    throw error;
  }
};