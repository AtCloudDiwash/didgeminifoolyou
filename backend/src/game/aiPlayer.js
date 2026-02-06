import {suspicionCalculator, suspicionScore} from "../ai/suspicionCalculator.js";
import {answerQuestion} from "../ai/answerQuestion.js";

// Utility function to generate a random AI age within the group's range
export function generateAIAge(minGroupAge, maxGroupAge) {
  return Math.floor(Math.random() * (maxGroupAge - minGroupAge + 1)) + minGroupAge;
}

export class AIPlayer {

  //private attributes
  #swapLeft;

  constructor(gameInstance, name, age, difficultyMode, serverCode) {
    this.gameInstance = gameInstance;
    this.name = name;
    this.age = age;
    this.difficultyMode = difficultyMode;
    this.isAI = true;
    this.serverCode = serverCode;
    this.#swapLeft = difficultyMode === "easy"?1:2;
  }

  details(){
    return {name: this.name, age: this.age};
  }

  useSwap(){
    this.#swapLeft = this.#swapLeft - 1;
  }

  getSwapLeft(){
    return this.#swapLeft;
  }

  // switchVote(){
    
  // }

  // Placeholder methods for AI behavior - will be implemented later
  async decideAnswer(question) {
    const answer = await answerQuestion(question, this.age);
    return answer;
  }

  async decideVote(players) {

  }

  async decideChat(chatLog) {

  }

}
