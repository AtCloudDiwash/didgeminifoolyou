import { Game } from '../game/game.js';
import WebSocket, { WebSocketServer } from "ws";
import { supabase } from "../../config/config.js";
import { deleteLobby } from '../controllers/lobbyController.js';

const wss = new WebSocketServer({ noServer: true });

// Connected Player details
const lobbies = {};
const lobbiesLog = {};

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
  lobby.state = 'playing';

  // Snapshot players to Database when game starts
  try {
    const data = await updatePlayers(
      serverCode,
      lobby.players.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age
      }))
    );

    if (data) {
      console.log("Lobby playing")
    }

  } catch (err) {
    console.log("Something unsual happened");
  }


  lobby.game = new Game(
    lobby.players,
    lobby.difficultyMode,
    lobby.totalRounds,
    wss
  );
  lobby.game.startRound();

  // Game class will handle messages, so remove the direct broadcast here.
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

    lobbies[serverCode] = {
      players: [],
      state: 'waiting',
      max_players: data[0].max_players,
      totalRounds: data[0].rounds,       // Store totalRounds
      difficultyMode: data[0].difficulty // Store difficultyMode
    };

    lobbiesLog[serverCode] = {
      logs: []
    }
  }

  if (lobbies[serverCode].state === 'playing') {
    ws.send(
      JSON.stringify({ type: "error", message: "Game is currently in progress" })
    );
    ws.close();
    return;
  }

  //checks if the player with same name exists
  const exists = lobbies[serverCode].players.some(
    p => p.name === playerInfo.name
  );

  if (exists) {
    ws.send(
      JSON.stringify({ type: "error", message: "Player with this name already in lobby" })
    );
    ws.close();
    return;
  }

  if (lobbies[serverCode].players.length >= lobbies[serverCode].max_players) {
    ws.send(
      JSON.stringify({ type: "error", message: "Lobby is full" })
    );
    ws.close();
    return;
  }

  // Add player to lobby
  lobbies[serverCode].players.push({ ...playerInfo, ws });
  console.log(`${playerInfo.name} connceted`)
  lobbiesLog[serverCode].logs.push(`${playerInfo.name} joined the server`);

  ws.send(
    JSON.stringify({
      type: "logs",
      logs: lobbiesLog[serverCode].logs.slice(-10)
    })
  );

  //Greets the new joining user and returns them current players in the lobby
  lobbies[serverCode].players.forEach((player) => {
    if (player.ws.readyState === WebSocket.OPEN && ws === player.ws) {
      player.ws.send(
        JSON.stringify({
          type: "welcome",
          message: `Hello ${playerInfo.name}, you joined lobby ${serverCode}`,
          players: lobbies[serverCode].players.map((player) => player.name),
          serverCode: serverCode
        })
      );
    }
  });

  if (lobbies[serverCode].players.length === lobbies[serverCode].max_players) {
    handleAutoStart(serverCode, wss); // Game auto starts
  }

  // Listen to messages from this player
  ws.on("message", (message) => {
    console.log(`Message from ${playerInfo.name}:`, message.toString());
    try {
      const parsedMessage = JSON.parse(message.toString());
      const game = lobbies[serverCode].game;

      if (!game || !game.currentRound) {
        console.warn(`No active game or round for serverCode: ${serverCode}`);
        return;
      }

      switch (parsedMessage.type) {
        case "submit_answer":
          game.currentRound.handlePlayerAnswer(playerInfo.id, parsedMessage.answer);
          break;
        case "submit_vote":
          game.currentRound.handlePlayerVote(playerInfo.id, parsedMessage.votedPlayerId);
          break;
        case "chat_message":
          // Log chat message to the round's private chatlog
          if (game && game.currentRound) {
            game.currentRound.handlePlayerChat(playerInfo.name, parsedMessage.message);
          }
          // Broadcast chat message to all players in the lobby
          lobbies[serverCode].players.forEach((player) => {
            if (player.ws.readyState === WebSocket.OPEN) {
              player.ws.send(
                JSON.stringify({
                  type: "chat_message",
                  sender: playerInfo.name,
                  message: parsedMessage.message,
                })
              );
            }
          });
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
  ws.on("close", async () => {
    if (lobbies[serverCode]) {
      lobbies[serverCode].players = lobbies[serverCode].players.filter(
        (p) => p.ws !== ws
      );
      console.log(`${playerInfo.name} left lobby ${serverCode}`);
      lobbiesLog[serverCode].logs.push(`${playerInfo.name} left the server`);
      if (lobbies[serverCode].players.length === 0) {
        console.log(`Lobby ${serverCode} is empty, deleting...`);
        await deleteLobby(serverCode);
        delete lobbies[serverCode];
        delete lobbiesLog[serverCode];
      }
    }
  });
}
);

export default wss;