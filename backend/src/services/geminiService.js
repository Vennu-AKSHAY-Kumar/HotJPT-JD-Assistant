import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-3.5-flash";
const TIMEOUT_MS = 30000;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "Gemini API configuration is missing. Please check your environment variables."
    );
    error.status = 500;
    throw error;
  }

  return new GoogleGenAI({ apiKey });
}

function withTimeout(promise, timeoutMs = TIMEOUT_MS) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(
        "Gemini is taking longer than expected. Please try again."
      );
      error.status = 504;
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  );
}

export async function generateStructured({ prompt, schema, maxOutputTokens = 4096 }) {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      })
    );

    if (!response?.text) {
      const error = new Error("Gemini returned an empty response.");
      error.status = 502;
      throw error;
    }

    try {
      return JSON.parse(response.text);
    } catch {
      const error = new Error("Gemini returned an invalid structured response.");
      error.status = 502;
      throw error;
    }
  } catch (error) {
    if (error.status) {
      throw error;
    }

    console.error("Gemini request failed:", error.message);

    const safeError = new Error(
      "Something went wrong while contacting Gemini. Please try again."
    );
    safeError.status = 502;
    throw safeError;
  }
}
