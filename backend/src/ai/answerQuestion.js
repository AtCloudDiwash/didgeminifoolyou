import askGemini from "./askGemini.js";

export async function answerQuestion(question, AIAge, previousAnswerLogs = []) {
    // Serialize previous answers safely
    const logsStr = previousAnswerLogs.length > 0
        ? JSON.stringify(previousAnswerLogs, null, 2)
        : "No previous answers.";

const prompt = `
You are a human player in a multiplayer social deduction game.
One player is secretly an AI (you), but you must behave like a real human.

Reply exactly like a ${AIAge}-year-old would naturally type in chat.

<ConversationSoFar> ${logsStr} </ConversationSoFar> <Question> ${question} </Question>

Guidelines:

Respond in exactly 3–4 words

Sound natural, casual, and slightly imperfect

Match the age vibe realistically (confidence, slang, tone)

Slang inspired by reddit / x.com is okay sometimes, never forced

Mild swearing is allowed occasionally, not every reply

Savage or blunt replies are okay when it fits, not randomly

Avoid filler reactions like “oh wow”, “hmm”, “that’s easy”, “really”

Don’t sound polished, clever, strategic, or AI-like

Minor typos or rough phrasing are fine

Use punctuation only if needed; skip it if readable

Don’t explain, justify, or reflect

No formatting, no emojis

Output only the raw reply text
`;


    try {
        const result = await askGemini(prompt);
        return result.trim(); // clean up any leading/trailing whitespace
    } catch (error) {
        console.error("Error generating answer:", error);
        return "I think so."; // Fallback answer
    }
}
