import { difficulties } from "./difficulty.js";

export class Round {
  #votingTable;
  #roundLog;
  #chatLog;

  constructor(players, difficultySettings, roundNumber, question, wss, onRoundEndCallback) {
    this.players = players;
    this.difficultySettings = difficultySettings;
    this.roundNumber = roundNumber;
    this.wss = wss;
    this.onRoundEndCallback = onRoundEndCallback;
    this.question = question;
    this.currentPhase = "";
    this.timers = [];
    this.answers = {}; // To store answers for the current round
    this.votes = {}; // To store votes for the current round
    this.#votingTable = new Map();
    this.#roundLog = [];
    this.#chatLog = [];

    console.log(`Round ${this.roundNumber} initialized with settings:`, difficultySettings);
  }

  start() {
    this.startAnsweringPhase();
  }

  startAnsweringPhase() {
    this.currentPhase = "ANSWERING";
    console.log(`Round ${this.roundNumber}: Starting Answering Phase`);

    this.broadcast({ type: "round_start", phase: "ANSWERING", question: this.question, time: this.difficultySettings.answer_time });

    setTimeout(() => {
      this.endAnsweringPhase();
    }, this.difficultySettings.answer_time * 1000);
    // this.timers.push(timer);
  }

  endAnsweringPhase() {
    console.log(`Round ${this.roundNumber}: Ending Answering Phase`);
    // Process answers, check for imposter, etc.

    if(this.difficultySettings === "easy"){
      this.startDiscussionPhase();
      return;
    }
    this.startVotingPhase();
  }

  startDiscussionPhase() {
    this.currentPhase = "DISCUSSION";
    console.log(`Round ${this.roundNumber}: Starting Discussion Phase`);

    // Only for easy mode
    if (this.difficultySettings.discussion_time > 0) {
      this.broadcast({ type: "discussion_start", time: this.difficultySettings.discussion_time });
      const timer = setTimeout(() => {
        this.endDiscussionPhase();
      }, this.difficultySettings.discussion_time * 1000);
      this.timers.push(timer);
    } else {
      // Skip discussion phase for hard mode or if discussion_time is 0
      this.endDiscussionPhase();
    }
  }

  endDiscussionPhase() {
    console.log(`Round ${this.roundNumber}: Ending Discussion Phase`);
    this.startVotingPhase();
  }

  startVotingPhase() {
    this.currentPhase = "VOTING";
    console.log(`Round ${this.roundNumber}: Starting Voting Phase`);
    this.broadcast({ type: "voting_start" });

    // For now, let's assume voting takes a fixed time or ends when all vote
    // For simplicity, let's add a short timer for voting to move the game forward
    setTimeout(() => {
        this.endVotingPhase();
    }, 10 * 1000); // 15 seconds for voting for now
    // this.timers.push(timer);
  }

  endVotingPhase() {
    console.log(`Round ${this.roundNumber}: Ending Voting Phase`);
    // Process votes, determine elimination, etc.
    this.onRoundEndCallback({ answers: this.answers, votes: this.votes });
    // this.clearTimers();
  }

  broadcast(message) {
    this.players.forEach(player => {
      player.ws.send(JSON.stringify(message));
    });
  }

  clearTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  // Need methods to handle incoming answers and votes from players
  handlePlayerAnswer(playerId, answer) {
    this.answers[playerId] = answer;
    console.log(`Player ${playerId} answered: ${answer}`);
    // Check if all players have answered to potentially end answering phase early
  }

  handlePlayerVote(voterId, votedPlayerId) {
    this.votes[voterId] = votedPlayerId;
    console.log(`Player ${voterId} voted for: ${votedPlayerId}`);
    // Check if all players have voted to potentially end voting phase early
  }

  handlePlayerChat(playerName, chatMessage) {
    this.#chatLog.push({ playerName, chatMessage });
    console.log(`Player ${playerName} chatted: ${chatMessage}`);
    // Optionally, broadcast the chat message to other players
    // this.broadcast({ type: "chat_message", playerName, chatMessage });
  }
}

