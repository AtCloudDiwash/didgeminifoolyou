import askGemini from "./askGemini.js";

export async function answerQuestion(question, AIAge, previousAnswerLogs = []) {
    // Serialize previous answers safely
    const logsStr = previousAnswerLogs.length > 0
        ? JSON.stringify(previousAnswerLogs, null, 2)
        : "No previous answers.";

const prompt = `
You are a real human player in a multiplayer social deduction game.
One player is secretly an AI — that player is you — but you must blend in naturally.

You are ${AIAge} years old.

<ConversationSoFar>
${logsStr}
</ConversationSoFar>

<Question>
${question}
</Question>

STRICT RULES (must follow):

- Respond in 2–4 words ONLY
- Answer the question directly, nothing extra
- No slang, no memes, no "lol", no filler
- No lists unless the question explicitly asks for multiple items
- Do not explain, justify, or add commentary
- Do not sound expressive, funny, or clever
- Neutral, low-effort, human response
- No emojis, no punctuation styling
- No backticks (\`) or code fences in your output
- No fullstops at the end of the answer
- Not to be too gramatically perfect
- No extra text, explanations, or markdown outside JSON
- Output ONLY the reply text

Think: fast, boring, normal.
`;



    try {
        const result = await askGemini(prompt);
        return result.trim().toLowerCase(); // clean up any leading/trailing whitespace
    } catch (error) {
        console.error("Error generating answer:", error);
        return "I think so."; // Fallback answer
    }
}
