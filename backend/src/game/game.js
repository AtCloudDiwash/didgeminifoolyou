import generateQuestions from "../ai/questionGenerator.js";
import { difficulties } from "./difficulty.js";
import { Round } from "./round.js"; // Will create this next
import { suspicionCalculator } from "../ai/suspicionCalculator.js";
import { supabase } from "../../config/config.js";


function mapToJSON(value) {
  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([k, v]) => [String(k), mapToJSON(v)])
    );
  }

  if (Array.isArray(value)) {
    return value.map(mapToJSON);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, mapToJSON(v)])
    );
  }

  return value;
}


export class Game {
  #gameDetail;
  #lobbyInstance;
  constructor(players, difficultyMode, totalRounds, wss, onGameEndCallback, aiPlayer, lobbyInstance) {
    this.players = players;
    this.difficultyMode = difficultyMode;
    this.totalRounds = totalRounds;
    this.wss = wss; // WebSocket server instance for broadcasting
    this.onGameEndCallback = onGameEndCallback; // Callback when the entire game ends
    this.currentRoundNumber = 0;
    this.scores = {}; // Initialize scores for all players
    this.difficultySettings = difficulties[difficultyMode];
    this.currentRound = null;
    this.allQuestions = []; // To store all questions generated at the start
    this.aiPlayer = aiPlayer;
    this.#gameDetail = new Map();
    this.#lobbyInstance = lobbyInstance;

    this.players.forEach(player => {
      this.scores[player.name] = 0; // Use player.name as key
    });

    // Generate all questions once when the game is created
    this.brewQuestions().then(questions => {
      this.allQuestions = questions;
      console.log("Questiosn brewed: ", this.allQuestions);

      this.broadcast(
        "game_intro",
        ["Welcome to did gemini fool you ?", `You have ${totalRounds} rounds to find AI imposter`,
          "Each round will have a question",
          `You will have ${this.difficultySettings.answer_time} second to answer a question`,
          "After you are done answering, you'll have to vote against AI imposter",
          "All the best. Crazy things might happen in the mid game"]);

      this.startRound();
    }).catch(error => {
      console.error("Error brewing questions:", error);
      // Handle error, e.g., end game, send error to players
    });

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

    if (this.currentRoundNumber >= this.totalRounds) {
      this.endGame();
      return;
    }
    this.currentRoundNumber++;
    console.log(`Starting Round ${this.currentRoundNumber}`);

    if (this.allQuestions.length === 0) {
      this.broadcast("announcement", "Loading the game");
      return;
    }

    const currentQuestion = this.allQuestions[this.currentRoundNumber - 1];

    this.currentRound = new Round(
      this.#lobbyInstance,
      this.difficultySettings,
      this.currentRoundNumber,
      currentQuestion,
      this.wss,
      this.onRoundEnd.bind(this),
      this.aiPlayer
    );
    this.currentRound.start();
  }

  async onRoundEnd(roundResults) {
    const data = roundResults.voteTable;
    this.#gameDetail.set(roundResults.roundNumber, roundResults);
    // find the max length among all candidates
    const highestVote = Math.max(
      ...Array.from(data.values(), votes => votes.length)
    );

    const playerToBeKicked = [...data.entries()]
      .filter(([_, votes]) => votes.length === highestVote)
      .map(([name]) => name);

    if (playerToBeKicked.length > 1) {
      this.broadcast("kick_info", "No one was kicked out");
    } else {
      if (playerToBeKicked[0] === this.aiPlayer.name && this.aiPlayer.getSwapLeft() > 0) {
        const scores = await suspicionCalculator(roundResults.voteTable, roundResults.answerLog, roundResults.aiPlayerName);
        this.aiPlayer.useSwap();
        this.broadcast("announcement", "Something mysterious happened in this round");
        const [playerToKick] = Object.entries(scores.suspicionScores)
          .reduce((max, current) =>
            current[1] > max[1] ? current : max
          );
        this.#lobbyInstance.kickPlayer(playerToKick);
      } else {
        if (playerToBeKicked[0] === this.aiPlayer.name) {
          this.broadcast("human_wins", "Yay! you caught the imposter");
          this.endGame();
          return;
        } else {
          this.#lobbyInstance.kickPlayer(playerToBeKicked[0]);
        }
      }
    }

    if (this.#lobbyInstance.getPlayers().length > 1) {
      this.startRound();
    } else {
      this.broadcast("gemini_wins", "Game over gemini fooled you");
      this.endGame();
      return;
    }
  }

  async endGame() {
    console.log("Game Over!");
    console.log("Your game data saving on supabase");
    const gameData = mapToJSON(this.#gameDetail);
    console.log(gameData);
    console.log(JSON.stringify(gameData));
    const { data, error } = await supabase
      .from("game_log")
      .insert({
        data: gameData
      }).select().single();

    if (data) {
      console.log(data);
    }

    this.#lobbyInstance.getPlayers().forEach(player => {
      player.ws.send(JSON.stringify({ type: "game_over", message: "Thanks for playing. Create new server and play more" }));
    });
    if (this.onGameEndCallback) {
      this.onGameEndCallback();
    }
  }


  // getters
  getGameDetails() {
    return this.#gameDetail;
  }

  // methods

  broadcast(type, message) {
    this.#lobbyInstance.getPlayers().forEach(player => {
      player.ws.send(JSON.stringify({ type, message }));
    });
  }


}
