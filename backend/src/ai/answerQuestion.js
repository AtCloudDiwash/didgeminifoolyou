import askGemini from "./askGemini.js";

export async function answerQuestion(question, AIAge, previousAnswerLogs = []) {
    // Serialize previous answers safely
    const logsStr = previousAnswerLogs.length > 0
        ? JSON.stringify(previousAnswerLogs, null, 2)
        : "No previous answers.";

const prompt = `
You are a real human player in a multiplayer social deduction game.
One player is secretly an AI — that player is you — but you must blend in naturally.

Reply exactly like a ${AIAge}-year-old chatting in the moment.

<ConversationSoFar> ${logsStr} </ConversationSoFar>
<Question> ${question} </Question>

Guidelines:

Respond in exactly 3–4 words

Write like normal casual texting — slightly messy, not polished

Match the confidence and tone of someone your age

Light slang is fine, but keep it natural and minimal

Mild swearing only if it genuinely fits the moment

Avoid overreactions, filler, or commentary on the game state

Don’t sound clever, analytical, or strategic

Minor typos are okay

No emojis, no explanations, no formatting

Output only the raw reply text
`;


    try {
        const result = await askGemini(prompt);
        return result.trim().toLowerCase(); // clean up any leading/trailing whitespace
    } catch (error) {
        console.error("Error generating answer:", error);
        return "I think so."; // Fallback answer
    }
}
