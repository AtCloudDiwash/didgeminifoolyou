import askGemini from "./askGemini.js";

export default async function generateQuestions(gameData, model = "gemini-2.5-flash"){
    const {difficulty, rounds, ageRange} = gameData
    const prompt = `
        
        You are generating questions for a multiplayer social-deduction game where one player is secretly an AI imposter.
        
        <GameData>
            Age range: ${ageRange}
            Difficulty: ${difficulty}
            Number of rounds: ${rounds}
        </GameData>

        <QuestionFormat>
            1) Fun, playful, and engaging to answer
            2) Encourages spontaneous, human-like responses
            3) Avoids factual or research-based answers
            4) Avoids boring things and long answers
        </QuestionFormat>

        <Rules>
            1) Generate exactly {{ROUNDS}} questions
            2) Each question must be answerable in under 200 characters or few sentences
            3) Questions must be non-personal and open-ended
            4) No explanations, no numbering, no emojis
        </Rules>

        <Important>
            In Easy mode, questions may subtly help humans notice AI-like behavior
            In Hard mode, questions must not help humans identify the AI
        </Important>

        <OutputFormat>
            Return only a valid JSON array of question strings
            <Example>
                If number of rounds 4 then output is ["question 1", "question 2", "question 3", "question 4"]
            </Example>
        </OutputFormat>
    
    `
    const result = await askGemini(prompt, model);

    return JSON.parse(result);
}