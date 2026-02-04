// import { GoogleGenAI } from '@google/genai';
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function askGemini(prompt, model = "gemini-3-flash-preview", retries = 3) {
    /*
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            const isOverloaded = error.status === 503 || (error.error && error.error.code === 503);
            if (isOverloaded && attempt < retries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                console.warn(`Gemini API overloaded (503). Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("Gemini API Error:", error);
                if (attempt === retries) {
                    // Return a safe fallback instead of crashing
                    return "I am a human player.";
                }
                throw error; // Rethrow if not a 503 or if we want to bubble up other errors (but we catch 503s to retry)
            }
        }
    }
    */
    return "I am a human worker from Silicon Valley.";
}