import { difficulties } from "./difficulty.js";

export class Round {
  #votingTable;
  #answerLog;
  // #discussionLog;

  constructor(players, difficultySettings, roundNumber, question, wss, onRoundEndCallback, aiPlayer) {
    this.players = players;
    this.difficultySettings = difficultySettings;
    this.roundNumber = roundNumber;
    this.wss = wss;
    this.onRoundEndCallback = onRoundEndCallback;
    this.question = question;
    this.currentPhase = "";
    this.timers = [];
    this.#votingTable = new Map();
    this.#answerLog = new Map();
    // this.#discussionLog = [];
    this.aiPlayer = aiPlayer;

    console.log(`Round ${this.roundNumber} initialized with settings:`, difficultySettings);
  }

  start() {
    this.startAnsweringPhase();
  }

  async startAnsweringPhase() {
    this.currentPhase = "ANSWERING";
    console.log(`Round ${this.roundNumber}: Starting Answering Phase`);

    this.broadcast({ type: "answering_phase", message: { question: this.question, time: `You have ${this.difficultySettings.answer_time} seconds` } });

    const aiAnswer = await this.aiPlayer.decideAnswer(this.question);
    setTimeout(() => {
      this.broadcast({ type: "answer", message: aiAnswer });
      this.#answerLog.set(`${this.aiPlayer.name} (AI Player)`, aiAnswer);
    }, 35000)

    setTimeout(() => {
      this.endAnsweringPhase();
    }, this.difficultySettings.answer_time * 1000);
  }

  endAnsweringPhase() {
    console.log(`Round ${this.roundNumber}: Ending Answering Phase`);

    // Process answers, check for imposter, etc.
    this.startVotingPhase();
  }

  async startDiscussionPhase() {

    /* ............ This feature is incomplete ............ */

    this.currentPhase = "DISCUSSION";
    console.log(`Round ${this.roundNumber}: Starting Discussion Phase`);

    // Only for easy mode
    if (this.difficultySettings === "easy" && this.difficultySettings.discussion_time > 0) {
      this.broadcast({ type: "discussion_phase", time: this.difficultySettings.discussion_time });

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
    /* ............ This feature is incomplete ............ */
    console.log(`Round ${this.roundNumber}: Ending Discussion Phase`);
    this.startVotingPhase();
  }

  async startVotingPhase() {

    this.currentPhase = "VOTING";
    console.log(`Round ${this.roundNumber}: Starting Voting Phase`);
    this.broadcast({ type: "voting_phase" });
    this.#votingTable.clear() // Table gets cleared

    setTimeout(() => {
      this.endVotingPhase();
    }, this.difficultySettings.voting_time * 1000);
  }

  endVotingPhase() {
    console.log(`Round ${this.roundNumber}: Ending Voting Phase`);
    this.onRoundEndCallback({ voteTable: this.#votingTable, answerLog: this.#answerLog, aiPlayerName: this.aiPlayer.name, roundNumber: this.roundNumber, playerInfo: this.players});
  }

  broadcast(message, excludePlayerName = null) {
    this.players.forEach(player => {
      if (excludePlayerName && player.name === excludePlayerName) {
        return;
      }
      player.ws.send(JSON.stringify(message));
    });
  }

  // Not necessary
  clearTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  handlePlayerAnswer(playerName, answer) {
    this.broadcast({ type: "answer", sender: playerName, answer: answer }, playerName);
    if (!this.#answerLog.has(playerName)) {
      this.#answerLog.set(playerName, answer);
    }
  }

  handlePlayerVote(playerName, vote) {
    if (this.#votingTable.has(vote)) {
      this.#votingTable.get(vote).push(playerName);
    } else {
      this.#votingTable.set(vote, [playerName]);
    }
  }
}

