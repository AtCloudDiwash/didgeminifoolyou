import { difficulties } from "./difficulty.js";

export class Round {
  #votingTable;
  #answerLog;
  #phaseTimer;
  #lobbyInstance;
  // #discussionLog;

  constructor(lobbyInstance, difficultySettings, roundNumber, question, wss, onRoundEndCallback, aiPlayer) {
    this.#lobbyInstance = lobbyInstance;
    this.difficultySettings = difficultySettings;
    this.roundNumber = roundNumber;
    this.wss = wss;
    this.onRoundEndCallback = onRoundEndCallback;
    this.question = question;
    this.currentPhase = "";
    this.timers = [];
    this.#votingTable = new Map();
    this.#answerLog = new Map();
    this.#phaseTimer = null;
    // this.#discussionLog = [];
    this.aiPlayer = aiPlayer;

    console.log(`Round ${this.roundNumber} initialized with settings:`, difficultySettings);
  }

  get players() {
    return this.#lobbyInstance.getPlayers();
  }

  startPhaseTimer(duration) {
    if (this.#phaseTimer) clearInterval(this.#phaseTimer);

    let timeLeft = duration;
    this.#phaseTimer = setInterval(() => {
      timeLeft--;
      this.broadcast("timer_tick", timeLeft);

      if (timeLeft <= 0) {
        clearInterval(this.#phaseTimer);
        this.#phaseTimer = null;
      }
    }, 1000);
  }

  start() {
    this.startAnsweringPhase();
  }

  async startAnsweringPhase() {
    this.currentPhase = "ANSWERING";
    console.log(`Round ${this.roundNumber}: Starting Answering Phase`);

    this.broadcast("answering_phase", { question: this.question, time: `${this.difficultySettings.answer_time}` });

    const aiAnswer = await this.aiPlayer.decideAnswer(this.question);
    setTimeout(() => {
      this.broadcast("ai_answer", {message: aiAnswer, senderName: this.aiPlayer.name});
      this.#answerLog.set(`${this.aiPlayer.name} (AI Player)`, aiAnswer);
    }, 35000)

    this.startPhaseTimer(this.difficultySettings.answer_time);

    setTimeout(() => {
      this.endAnsweringPhase();
    }, this.difficultySettings.answer_time * 1000);
  }

  endAnsweringPhase() {
    if (this.#phaseTimer) clearInterval(this.#phaseTimer);
    this.#phaseTimer = null;
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
    this.broadcast("voting_phase", {
      current_players: [
        ...this.players.map(p => p.name),
        this.aiPlayer.name
      ],
      time: this.difficultySettings.voting_time
    });
    this.#votingTable.clear();

    this.startPhaseTimer(this.difficultySettings.voting_time);

    setTimeout(() => {
      this.endVotingPhase();
    }, this.difficultySettings.voting_time * 1000);
  }

  endVotingPhase() {
    if (this.#phaseTimer) clearInterval(this.#phaseTimer);
    this.#phaseTimer = null;

    console.log(`Round ${this.roundNumber}: Ending Voting Phase`);
    this.broadcast("round_end", "Round ended");
    this.onRoundEndCallback({
      voteTable: this.#votingTable,
      answerLog: this.#answerLog,
      aiPlayerName: this.aiPlayer.name,
      roundNumber: this.roundNumber,
      playerInfo: this.players.map(p => ({
        name: p.name,
        age: p.age
      }))
    });
  }

  broadcast(type, message, excludePlayerName = null) {
    this.players.forEach(player => {
      if (excludePlayerName && player.name === excludePlayerName) {
        return;
      }
      player.ws.send(JSON.stringify({ type, message }));
    });
  }

  clearTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
    if (this.#phaseTimer) {
      clearInterval(this.#phaseTimer);
      this.#phaseTimer = null;
    }
  }

  handlePlayerAnswer(playerName, answer) {
    this.broadcast("player_answer", { sender: playerName, answer: answer });
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
