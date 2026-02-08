export default async function askGemini(prompt, model = "gemini-3-flash-preview", retries = 3) {
    const apiKey = process.env.VERTEX_AI_API_KEY;
    
    if (!apiKey) {
        console.error("VERTEX_AI_API_KEY is not set");
        return "I am a human player.";
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(
                `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [{ text: prompt }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: errorData.error?.message || response.statusText
                };
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            return text || "I am a human player.";

        } catch (error) {
            const isRetryable = error.status === 503 || error.status === 429;
            
            if (isRetryable && attempt < retries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`Vertex AI error (${error.status}). Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("Vertex AI Error:", error.message || error);
                if (attempt === retries) {
                    return "I am a human player.";
                }
            }
        }
    }
    
    return "I am a human worker from Silicon Valley.";
}