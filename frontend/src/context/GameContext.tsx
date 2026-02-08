import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useNavigate } from 'react-router-dom';

type GameState = 'LOBBY' | 'GAME_STARTING' | 'PLAYING' | 'VOTING' | 'ROUND_END' | 'SHOW_RESULT' | 'GAME_OVER' | 'ANNOUNCEMENT' | 'HUMAN_WINS' | 'GEMINI_WINS' | 'GHOST_MODE';

interface GameContextType {
    gameState: GameState;
    serverCode: string | null;
    players: string[];
    currentQuestion: { text: string; time: number } | null;
    timeLeft: number;
    gameMessage: string | null;
    chatMessages: { name: string; message: string }[];
    onlinePlayers: string;
    kickedPlayers: string[];
    setServerCode: (code: string | null) => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

// Reducer for Game state
type GameStateType = {
    gameState: GameState;
    serverCode: string | null;
    players: string[];
    currentQuestion: { text: string; time: number } | null;
    timeLeft: number;
    gameMessage: string | null;
    chatMessages: { name: string; message: string }[];
    onlinePlayers: string;
    kickedPlayers: string[];
};

type GameAction =
    | { type: 'SET_SERVER_CODE'; code: string | null }
    | { type: 'SET_ONLINE_PLAYERS'; count: string }
    | { type: 'GAME_STARTING'; message: string; serverCode?: string }
    | { type: 'SET_ANNOUNCEMENT'; message: string }
    | { type: 'ANSWERING_PHASE'; question: string; time: number }
    | { type: 'VOTING_PHASE'; players: string[]; time: number }
    | { type: 'TIMER_TICK'; time: number }
    | { type: 'ROUND_END'; message: string }
    | { type: 'GAME_OVER'; message: string }
    | { type: 'SHOW_RESULT'; message: string }
    | { type: 'ADD_CHAT_MESSAGE'; name: string; message: string }
    | { type: 'ADD_KICKED_PLAYER'; playerName: string }
    | { type: 'RESET' }
    | { type: 'HUMAN_WINS'; message: string }
    | { type: 'GEMINI_WINS'; message: string }
    | { type: 'GHOST_MODE'; message: string };

function gameReducer(state: GameStateType, action: GameAction): GameStateType {
    switch (action.type) {
        case 'SET_SERVER_CODE':
            return { ...state, serverCode: action.code };

        case 'SET_ONLINE_PLAYERS':
            return { ...state, onlinePlayers: action.count };

        case 'GAME_STARTING':
            return {
                ...state,
                gameState: 'GAME_STARTING',
                gameMessage: action.message,
                serverCode: action.serverCode || state.serverCode,
            };

        case 'SET_ANNOUNCEMENT':
            return { ...state, gameMessage: action.message };

        case 'ANSWERING_PHASE':
            // Don't change state if player is in ghost mode
            if (state.gameState === 'GHOST_MODE') return state;
            return {
                ...state,
                gameState: 'PLAYING',
                currentQuestion: { text: action.question, time: action.time },
                timeLeft: action.time,
            };

        case 'VOTING_PHASE':
            // Don't change state if player is in ghost mode
            if (state.gameState === 'GHOST_MODE') return state;
            return {
                ...state,
                gameState: 'VOTING',
                players: action.players,
                timeLeft: action.time,
            };

        case 'TIMER_TICK':
            return { ...state, timeLeft: action.time };

        case 'ROUND_END':
            // Don't change state if player is in ghost mode
            if (state.gameState === 'GHOST_MODE') return state;
            return {
                ...state,
                gameState: 'ROUND_END',
                gameMessage: action.message,
            };

        case 'GAME_OVER':
            return {
                ...state,
                gameState: 'GAME_OVER',
                gameMessage: action.message,
            };

        case 'SHOW_RESULT':
            // Don't change state if player is in ghost mode
            if (state.gameState === 'GHOST_MODE') return state;
            return {
                ...state,
                gameState: 'SHOW_RESULT',
                gameMessage: action.message,
            };

        case 'ADD_CHAT_MESSAGE':
            return {
                ...state,
                chatMessages: [...state.chatMessages, { name: action.name, message: action.message }],
            };

        case 'ADD_KICKED_PLAYER':
            return {
                ...state,
                kickedPlayers: [...state.kickedPlayers, action.playerName],
            };

        case 'RESET':
            return {
                gameState: 'LOBBY',
                serverCode: null,
                players: [],
                currentQuestion: null,
                timeLeft: 0,
                gameMessage: null,
                chatMessages: [],
                onlinePlayers: '0',
                kickedPlayers: [],
            };

        case 'HUMAN_WINS':
            return {
                ...state,
                gameState: 'HUMAN_WINS',
                gameMessage: action.message
            };
        case 'GEMINI_WINS':
            return {
                ...state,
                gameState: 'GEMINI_WINS',
                gameMessage: action.message
            };
        case 'GHOST_MODE':
            return {
                ...state,
                gameState: 'GHOST_MODE',
                gameMessage: action.message
            }
        default:
            return state;
    }
}

const initialGameState: GameStateType = {
    gameState: 'LOBBY',
    serverCode: null,
    players: [],
    currentQuestion: null,
    timeLeft: 0,
    gameMessage: null,
    chatMessages: [],
    onlinePlayers: '0',
    kickedPlayers: [],
};

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { lastMessage } = useWebSocket();
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);

    // Keep navigate ref updated
    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);

    const [state, dispatch] = useReducer(gameReducer, initialGameState);

    const setServerCode = useCallback((code: string | null) => {
        dispatch({ type: 'SET_SERVER_CODE', code });
    }, []);

    const resetGame = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    // Handle WebSocket messages - optimized to prevent unnecessary re-renders
    useEffect(() => {
        if (!lastMessage) return;

        const msg = lastMessage;

        switch (msg.type) {
            case 'chat_message':
                if (typeof msg.message === 'object') {
                    dispatch({
                        type: 'ADD_CHAT_MESSAGE',
                        name: msg.message.name,
                        message: msg.message.message
                    });
                } else {
                    dispatch({
                        type: 'ADD_CHAT_MESSAGE',
                        name: 'Unknown',
                        message: String(msg.message)
                    });
                }
                break;

            case 'online_players':
                dispatch({ type: 'SET_ONLINE_PLAYERS', count: msg.message });
                break;

            case 'game_starting':
                if (typeof msg.message === 'object') {
                    const targetCode = msg.message.serverCode;
                    dispatch({
                        type: 'GAME_STARTING',
                        message: msg.message.text,
                        serverCode: targetCode
                    });
                    if (targetCode) {
                        navigateRef.current(`/game/${targetCode}`);
                    }
                } else {
                    dispatch({ type: 'GAME_STARTING', message: msg.message });
                }
                break;

            case 'announcement':
                dispatch({ type: 'SET_ANNOUNCEMENT', message: msg.message });
                break;

            case 'answering_phase':
                dispatch({
                    type: 'ANSWERING_PHASE',
                    question: msg.message.question,
                    time: Number(msg.message.time)
                });
                break;

            case 'voting_phase':
                if (typeof msg.message === 'object' && 'current_players' in msg.message) {
                    dispatch({
                        type: 'VOTING_PHASE',
                        players: msg.message.current_players,
                        time: Number(msg.message.time)
                    });
                }
                break;

            case 'player_answer':
                if (typeof msg.message === 'object' && 'sender' in msg.message) {
                    const { sender, answer } = msg.message as { sender: string; answer: string };
                    dispatch({
                        type: 'ADD_CHAT_MESSAGE',
                        name: sender,
                        message: `Answer: ${answer}`
                    });
                }
                break;

            case 'ai_answer':
                if (typeof msg.message === 'object' && 'message' in msg.message && 'senderName' in msg.message) {
                    const { message, senderName } = msg.message as { message: string; senderName: string };
                    dispatch({
                        type: 'ADD_CHAT_MESSAGE',
                        name: senderName,
                        message: message
                    });
                }
                break;

            case 'timer_tick':
                dispatch({ type: 'TIMER_TICK', time: Number(msg.message) });
                break;

            case 'game_over':
                dispatch({ type: 'GAME_OVER', message: msg.message });
                break;

            case 'round_end':
                dispatch({
                    type: 'ROUND_END',
                    message: typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message)
                });
                break;

            case 'kick_info':
                // Extract player name from message: "Player with username {name} was kicked out"
                const kickMatch = msg.message.match(/Player with username (.+) was kicked out/);
                if (kickMatch && kickMatch[1]) {
                    dispatch({ type: 'ADD_KICKED_PLAYER', playerName: kickMatch[1] });
                }
                dispatch({ type: 'SHOW_RESULT', message: msg.message });
                break;
            case 'gemini_wins':
                dispatch({ type: "GEMINI_WINS", message: msg.message });
                break;
            case 'human_wins':
                dispatch({ type: "HUMAN_WINS", message: msg.message });
                break;
            case 'ghost_mode':
                dispatch({ type: "GHOST_MODE", message: msg.message });
                break;
        }
    }, [lastMessage]); // Only lastMessage as dependency

    return (
        <GameContext.Provider value={{
            gameState: state.gameState,
            serverCode: state.serverCode,
            players: state.players,
            currentQuestion: state.currentQuestion,
            timeLeft: state.timeLeft,
            gameMessage: state.gameMessage,
            chatMessages: state.chatMessages,
            onlinePlayers: state.onlinePlayers,
            kickedPlayers: state.kickedPlayers,
            setServerCode,
            resetGame
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
