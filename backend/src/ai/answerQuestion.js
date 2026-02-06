import askGemini from "./askGemini.js";

export async function answerQuestion(question, AIAge, previousAnswerLogs = []) {
    // Serialize previous answers safely
    const logsStr = previousAnswerLogs.length > 0
        ? JSON.stringify(previousAnswerLogs, null, 2)
        : "No previous answers.";

    const prompt = `
            You are generating questions for a multiplayer social-deduction game with one AI imposter.

            STRICT OUTPUT RULES:
            - Return ONLY raw JSON
            - No markdown
            - No code blocks
            - No explanations
            - No numbering
            - No emojis

            GAME SETTINGS:
            - Age range: ${ageRange}
            - Difficulty: ${difficulty}
            - Number of rounds: ${rounds}

            QUESTION RULES:
            - Generate exactly ${rounds} questions
            - Each question must be fun and engaging
            - Each question must be answerable in exactly 3 to 5 words (no more, no less)
            - All answers should naturally be lowercase
            - Avoid factual, research-based, or personal questions
            - Avoid questions that require long explanations
            - Questions should invite short, casual, opinionated answers

            DIFFICULTY BEHAVIOR:
            - Easy mode: questions may subtly expose AI-like behavior
            - Hard mode: questions must NOT help identify the AI

            OUTPUT FORMAT:
            Return a JSON array of strings only.

            Example:
            ["Question one?", "Question two?"]
            `;

    try {
        const result = await askGemini(prompt);
        return result.trim(); // clean up any leading/trailing whitespace
    } catch (error) {
        console.error("Error generating answer:", error);
        return "I think so."; // Fallback answer
    }
}
