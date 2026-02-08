export class Lobby {
    #players;
    #state;
    #maxPlayers;
    #totalRounds;
    #difficultyMode;
    #usedNames;
    #aiPlayer;
    #gameInstance;
    constructor(players, state = "waiting", maxPlayers, totalRounds, difficultyMode, aiPlayer = null, gameInstance) {
        this.#players = players;
        this.#state = state;
        this.#maxPlayers = maxPlayers;
        this.#totalRounds = totalRounds;
        this.#difficultyMode = difficultyMode;
        this.#usedNames = new Set();
        this.#aiPlayer = aiPlayer;
        this.#gameInstance = gameInstance;
    }

    lobbyDetails() {
        return {
            players: this.#players,
            state: this.#state,
            maxPlayers: this.#maxPlayers,
            totalRounds: this.#totalRounds,
            difficultyMode: this.#difficultyMode,
            usedNames: this.#usedNames,
            aiPlayer: this.#aiPlayer,
        }
    }

    //getters

    getPlayers() {
        return this.#players;
    }

    getMaxPlayers() {
        return this.#maxPlayers;
    }

    getDifficultyMode() {
        return this.#difficultyMode;
    }

    getAIPlayer() {
        return this.#aiPlayer;
    }

    getLobbyState() {
        return this.#state;
    }

    getLobbyRounds() {
        return this.#totalRounds
    }

    getUsedNames() {
        return this.#usedNames;
    }

    getGameInstance() {
        return this.#gameInstance;
    }

    //setters
    setPlayer(playerInfo) {
        this.#players.push(playerInfo);
    }

    setLobbyState(state) {
        this.#state = state;
    }

    setUsedNames(name) {
        this.#usedNames.add(name);
    }

    setAIPlayer(aiPlayerInfo) {
        this.#aiPlayer = aiPlayerInfo;
    }

    setGameInstance(gameInstance) {
        this.#gameInstance = gameInstance;
    }

    // deleters
    removePlayer(playerWS) {
        this.#players = this.#players.filter(
            (p) => p.ws !== playerWS
        );
    }

    //methods
    kickPlayer(playerName) {
        const player = this.#players.find(p => p.name === playerName);

        if (!player) return;

        player.ws.send(JSON.stringify({
            type: "ghost_mode",
            message: "You were kicked from the game"
        }));

        // Broadcast to all players EXCEPT the kicked player
        this.#players.forEach(p => {
            if (p.name !== playerName) {
                p.ws.send(JSON.stringify({
                    type: "kick_info",
                    message: `Player with username ${playerName} was kicked out`
                }));
            }
        });
    }


    isAIPlayerPresent() {
        if (this.#aiPlayer == null) {
            return false;
        }
        return true;
    }

    broadcast(type, message) {
        this.#players.forEach(player => {
            player.ws.send(JSON.stringify({ type, message }));
        });
    }

    broadCastAll(messageType) {
        switch (messageType) {
            case "online_players":
                this.#players.forEach(player => {
                    player.ws.send(
                        JSON.stringify({
                            type: "online_players",
                            message: `${this.#players.length}/${this.#maxPlayers}`
                        })
                    )
                });
                break;
            case "game_starting":
                this.#players.forEach(player => {
                    player.ws.send(
                        JSON.stringify({
                            type: "game_starting",
                            message: {
                                text: "The game is about to start!",
                                serverCode: this.#gameInstance ? "DUMMY_FOR_EXISTING" : "NEW" // Not strictly needed if we just pass the code
                            }
                        })
                    )
                });
                break;

            default:
                this.#players.forEach(player => {
                    player.ws.send(
                        JSON.stringify({
                            type: "game_over",
                            message: messageType    
                        })
                    )
                });
        }
    }

}