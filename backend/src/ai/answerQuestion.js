import askGemini from "./askGemini.js";

export async function answerQuestion(question, AIAge, previousAnswerLogs = []) {
    // Serialize previous answers safely
    const logsStr = previousAnswerLogs.length > 0
        ? JSON.stringify(previousAnswerLogs, null, 2)
        : "No previous answers.";

    const prompt = `
You are an AI playing a multiplayer social deduction game. One player is secretly AI (you), the rest are humans.
Answer the following question exactly like a human of age ${AIAge} would write.
Use the previous answers of all players to maintain a consistent human-like style and adapt naturally.

<PreviousAnswers>
${logsStr}
</PreviousAnswers>

<GameQuestion>
${question}
</GameQuestion>

<Instructions>
1) Answer concisely in 2-3 sentences or under 200 characters — the amount a human could realistically write in 50 seconds.
2) Use language, tone, and phrasing appropriate for a human of age ${AIAge}.
3) Keep it natural, casual, and human-like — include minor pauses, word choices, or phrasing a real human might use.
4) Reference previous answers subtly if it helps you sound human, but do not copy them exactly.
5) Avoid over-explaining, sounding too perfect, or suspiciously AI-like.
6) Return ONLY the answer as plain text — no quotes, JSON, or extra commentary.
</Instructions>
`;

    // const result = await askGemini(prompt);
    // return result.trim(); // clean up any leading/trailing whitespace
    return "My ai answer"
}
