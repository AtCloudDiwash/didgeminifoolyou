import generateQuestions from "../ai/questionGenerator.js";
import { difficulties } from "./difficulty.js";
import { Round } from "./round.js"; // Will create this next

export class Game {
  constructor(players, difficultyMode, totalRounds, wss) {
    this.players = players;
    this.difficultyMode = difficultyMode;
    this.totalRounds = totalRounds;
    this.wss = wss; // WebSocket server instance for broadcasting
    this.currentRoundNumber = 0;
    this.scores = {}; // Initialize scores for all players
    this.difficultySettings = difficulties[difficultyMode];
    this.currentRound = null;

    this.players.forEach(player => {
      this.scores[player.id] = 0; // Assuming each player has a unique 'id'
    });

    console.log(`Game created: ${this.difficultyMode} mode, ${this.totalRounds} rounds.`);

  }

  async brewQuestions() {
    const getAgeRange = () => {
      const ages = this.players.map(player => Number(player.age));
      return `${Math.min(...ages)}-${Math.max(...ages)}`;
    };
    const ageRange = getAgeRange();

    const gameData = {
      difficulty: this.difficultyMode,
      ageRange: ageRange,
      rounds: this.totalRounds
    }
    const questions = await generateQuestions(gameData);

    return questions;

  }

  async startRound() {
    this.currentRoundNumber++;
    console.log(`Starting Round ${this.currentRoundNumber}`);

    if (this.currentRoundNumber > this.totalRounds) {
      this.endGame();
      return;
    }

    const questions = await this.brewQuestions();

    this.currentRound = new Round(
      this.players,
      this.difficultySettings,
      this.currentRoundNumber,
      questions[this.currentRoundNumber-1],
      this.wss,
      this.onRoundEnd.bind(this)
    );
    this.currentRound.start();
  }

  onRoundEnd(roundResults) {
    // Process round results, update scores, etc.
    console.log(`Round ${this.currentRoundNumber} ended. Results:`, roundResults);
    // For now, let's just move to the next round
    this.startRound();
  }

  endGame() {
    console.log("Game Over!");
    // Broadcast final scores, determine winner, etc.
    this.players.forEach(player => {
      player.ws.send(JSON.stringify({ type: "game_over", scores: this.scores }));
    });
  }
}
