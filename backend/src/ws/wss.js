import { Game } from '../game/game.js';
import WebSocket, { WebSocketServer } from "ws";
import { supabase } from "../../config/config.js";
import { deleteLobby } from '../controllers/lobbyController.js';
import { AIPlayer, generateAIAge } from '../game/aiPlayer.js';
import { gameNamePool } from "../resources/gameNamePool.js";
import { Lobby } from "../game/lobby.js";

const wss = new WebSocketServer({ noServer: true });

// Connected Player details
const lobbies = {};

// Function to assign random name from the gameNamePool which has not been assigned

function assignRandomName(serverCode, namePool) {

  const lobby = lobbies[serverCode]
  if (!lobby) throw new Error("Lobby not found");

  // filter out names already used
  const availableNames = namePool.filter(name => !lobby.getUsedNames().has(name));

  if (availableNames.length === 0) {
    throw new Error("No available names left in pool");
  }

  // pick random
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];

  // mark as used
  lobby.setUsedNames(name);
  console.log(`${name} joined the server`)

  return name;
}

// Function to add an AI player to a lobby
const addAIToLobby = (serverCode, gameInstance) => {
  const lobby = lobbies[serverCode];
  if (!lobby) return;

  const ages = lobby.getPlayers().map(p => Number(p.age));
  const minGroupAge = ages.length > 0 ? Math.min(...ages) : 18; // Default min age
  const maxGroupAge = ages.length > 0 ? Math.max(...ages) : 60; // Default max age

  const aiName = assignRandomName(serverCode, gameNamePool);
  const aiAge = generateAIAge(minGroupAge, maxGroupAge);

  const aiPlayer = new AIPlayer(gameInstance, aiName, aiAge, lobby.getDifficultyMode(), serverCode);
  lobby.setAIPlayer(aiPlayer);

  console.log(`${aiPlayer.details().name} (AI) joined lobby server`);

};

const updatePlayers = async (serverCode, players) => {
  const { data, error } = await supabase
    .from("lobbies")
    .update({ players })
    .eq("server_code", serverCode)
    .select();

  if (error) {
    console.error("Failed to update players in Database:", error);
    throw error;
  }

  return data;
};

const handleAutoStart = async (serverCode, wss) => { // Added wss parameter
  if (!lobbies[serverCode]) return;

  const lobby = lobbies[serverCode];
  lobby.setLobbyState("playing");

  // Snapshot players to Database when game starts
  try {
    const data = await updatePlayers(
      serverCode,
      lobby.getPlayers().map(p => ({
        name: p.name,
        age: p.age
      }))
    );

    if (data) {
      console.log(lobby.getLobbyState());
    }

  } catch (err) {
    console.error("Error updating players in database during auto-start:", err);
  }


  lobby.broadCastAll("game_starting");

  lobby.setGameInstance(new Game(
    lobby.getPlayers(),
    lobby.getDifficultyMode(),
    lobby.getLobbyRounds(),
    wss,
    async () => { // onGameEndCallback correctly defined as async
      console.log(`Game ended for lobby ${serverCode}`);

      // 1️⃣ Broadcast "Game Over" message
      lobby.broadCastAll("game_over");

      // 2️⃣ Close all WebSocket connections
      lobby.getPlayers().forEach(player => {
        try {
          if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.close(1000, "Game ended");
          }
        } catch (err) {
          console.error("Error closing websocket:", err);
        }
      });

      // 3️⃣ Delete lobby (DB + memory)
      try {
        await deleteLobby(serverCode);
        delete lobbies[serverCode];
        console.log(`Lobby ${serverCode} deleted successfully`);
      } catch (err) {
        console.error("Failed to delete lobby:", err);
      }
    },
    lobby.getAIPlayer(),
    lobby
  ));

  const aiPlayer = lobby.getAIPlayer();
  if (aiPlayer) {
    aiPlayer.gameInstance = lobby.getGameInstance();
  }

};


wss.on("connection", async (ws, request, serverCode, playerInfo) => {

  if (!lobbies[serverCode]) {
    const { data, error } = await supabase
      .from("lobbies")
      .select("max_players, rounds, difficulty") // Fetch rounds and difficulty
      .eq("server_code", serverCode);

    if (error || !data || data.length === 0) {
      ws.close(1011, "Lobby not found");
      return;
    }

    lobbies[serverCode] = new Lobby(
      [],
      'waiting',
      data[0].max_players,
      data[0].rounds,
      data[0].difficulty
    )

    // Removed restriction for joining playing lobbies to support reconnection.
    // Reconnecting players will get a new random name but will receive future updates.


    if (lobbies[serverCode].getPlayers().length >= lobbies[serverCode].getMaxPlayers()) {
      ws.send(
        JSON.stringify({ type: "error", message: "Lobby is full" })
      );
      ws.close();
      return;
    }

    if (!lobbies[serverCode].isAIPlayerPresent()) {
      addAIToLobby(serverCode, null);
    }
  }


  // Assigning player with random name from the defined array of names
  try {
    playerInfo.name = assignRandomName(serverCode, gameNamePool);
    ws.send(JSON.stringify({ type: "announce_name", message: `Your game name is ${playerInfo.name}` }))
  } catch (error) {
    console.error("Failed to assign random name:", error);
    ws.send(JSON.stringify({ type: "error", message: error.message }));
    ws.close();
    return;
  }

  // Add player to lobby
  lobbies[serverCode].setPlayer({ ...playerInfo, ws });


  lobbies[serverCode].broadCastAll("online_players");


  if (lobbies[serverCode].getLobbyState() === 'waiting' && lobbies[serverCode].getPlayers().length === lobbies[serverCode].getMaxPlayers()) {
    handleAutoStart(serverCode, wss); // Game auto starts
  } else if (lobbies[serverCode].getLobbyState() === 'playing') {
    console.log(`Player ${playerInfo.name} joined an existing game in server ${serverCode}. Sending game_starting.`);
    ws.send(JSON.stringify({
      type: "game_starting",
      message: { text: "Reconnecting to game...", serverCode }
    }));
  }

  // Listen to messages from this player
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      const game = lobbies[serverCode].getGameInstance();
      console.log(game.currentRound);

      if (!game || !game.currentRound) {
        console.warn(`No active game or round for serverCode: ${serverCode}`);
        return;
      }

      switch (parsedMessage.type) {
        case "submit_answer":
          if (game && game.currentRound) {
            game.currentRound.handlePlayerAnswer(parsedMessage.name, parsedMessage.answer);
          }
          break;
        case "submit_vote":
          if (game && game.currentRound) {
            game.currentRound.handlePlayerVote(parsedMessage.name, parsedMessage.vote);
          }
          break;
        case "chat_message":
          // Log chat message to the round's private chatlog
          if (game && game.currentRound) {
            game.currentRound.handlePlayerChat(parsedMessage.name, parsedMessage.message);
          }
          break;
        // Add other message types as needed (e.g., chat messages)
        default:
          console.log(`Unknown message type: ${parsedMessage.type}`);
      }
    } catch (error) {
      console.error("Failed to parse message or handle game action:", error);
    }
  });

  // Handle disconnect
  ws.on("close", async (code, reason) => {
    console.log(`WebSocket closed for ${playerInfo.name}. Code: ${code}, Reason: ${reason}`);
    if (lobbies[serverCode]) {
      lobbies[serverCode].removePlayer(ws);
      lobbies[serverCode].broadCastAll("online_players");

      console.log(`${playerInfo.name} left the server`);

      if (lobbies[serverCode].getPlayers().length === 0) {
        console.log(`Lobby ${serverCode} is empty, deleting...`);
        await deleteLobby(serverCode);
        delete lobbies[serverCode];
      }
    }
  });
}
);

export default wss;