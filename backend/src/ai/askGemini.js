import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function askGemini(prompt, model = "gemini-2.5-flash") {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
}