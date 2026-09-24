const { GoogleGenerativeAI } = require("@google/generative-ai");

function createGeminiService({ apiKey = process.env.GEMINI_API_KEY, modelName = "gemini-flash-latest" } = {}) {
  const model = apiKey ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: modelName }) : null;

  return {
    async generateContent(prompt) {
      if (!model) {
        const err = new Error("Gemini is not configured.");
        err.statusCode = 503;
        throw err;
      }
      return model.generateContent(prompt);
    },
  };
}

module.exports = { createGeminiService };
