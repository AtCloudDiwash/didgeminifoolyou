import askGemini from "./askGemini.js";

export default async function generateQuestions(gameData) {
    const { difficulty, rounds, ageRange } = gameData
    /*
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
            - Each question must be answerable in under 200 characters
            - Avoid factual, research-based, or personal questions
            - Avoid questions that require long explanations

            DIFFICULTY BEHAVIOR:
            - Easy mode: questions may subtly expose AI-like behavior
            - Hard mode: questions must NOT help identify the AI

            OUTPUT FORMAT:
            Return a JSON array of strings only.

            Example:
            ["Question one?", "Question two?"]
            `;
    const result = await askGemini(prompt);

    return JSON.parse(result);
    */

    const hardcodedQuestions = [
        'Would you rather live in a world with no music but amazing food, or no amazing food but incredible music?',
        'Which is more appealing: a perfectly ordered chaos or a mildly chaotic order?',
        'If all roads suddenly became made of marshmallows, how would you prefer to travel?',
        'Which would be more unsettling: a world where everyone always whispers, or one where everyone always shouts?',
        'If you could swap lives with any animal for 24 hours, which one would you choose and why?',
        'Is it better to be a big fish in a small pond or a small fish in a big pond?',
        'If you could have a conversation with your future self for 5 minutes, what is the first thing you would ask?',
        'What is a secret talent you have that almost no one knows about?',
        'If you could create a new law that everyone in the world had to follow, what would it be?',
        'Would you rather be able to speak every language in the world or be able to talk to animals?'
    ];

    // Shuffle and pick the required number of questions
    return hardcodedQuestions.sort(() => 0.5 - Math.random()).slice(0, rounds);
}