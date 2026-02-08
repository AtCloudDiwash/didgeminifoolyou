import askGemini from "./askGemini.js";

export let suspicionScore = null;
let prevData = null;
export async function suspicionCalculator(votingTable, answerLogs, aiPlayerName) {
    const votingStr = JSON.stringify(Object.fromEntries(votingTable));
    const answerStr = JSON.stringify(answerLogs);

    const prompt = `
        You are an AI imposter in a multiplayer social deduction game.
        One player is secretly AI (you), and the rest are humans. Your goal is to calculate how suspicious each human player is towards you
        based on the GameData provided below and data from previous calculations by you.

        <GameData>
        - Voting Table: ${votingStr}
        - Answer Logs: ${answerStr}
        - AI Player Name: ${aiPlayerName}
        - previous data: ${prevData}
        </GameData>

        <Rules>
        1) RETURN ONLY valid JSON.
        2) DO NOT include ANY extra text, explanations, or markdown outside JSON.
        3) DO NOT use backticks (\`) or code fences in your output.
        4) JSON keys:
        - "suspicionScores": object mapping each human player name to a number between 0 (least suspicious) and 1 (most suspicious)
        5) Include all votes and discussion messages in your reasoning.
        6) Easy mode: subtly help humans notice AI-like behavior.
        7) Hard mode: be fully deceptive; do not reveal your identity.
        </Rules>

        <OutputExample>
        {
        "suspicionScores": {
            "player1": 0.4,
            "player2": 0.7,
            "player3": 0.2
        }
        }
        </OutputExample>
        `;

    const result = await askGemini(prompt, model = "gemini-3-flash-preview");
    prevData = result;
    return JSON.parse(result);
}