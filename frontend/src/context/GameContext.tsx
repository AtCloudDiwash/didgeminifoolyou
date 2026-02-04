import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useNavigate } from 'react-router-dom';

type GameState = 'LOBBY' | 'GAME_STARTING' | 'PLAYING' | 'VOTING' | 'ROUND_END' | 'SHOW_RESULT' | 'GAME_OVER';

interface GameContextType {
    gameState: GameState;
    serverCode: string | null;
    players: string[];
    currentQuestion: { text: string; time: number } | null;
    timeLeft: number;
    gameMessage: string | null;
    chatMessages: { name: string; message: string }[];
    onlinePlayers: string;
    setServerCode: (code: string | null) => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { lastMessage } = useWebSocket();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState<GameState>('LOBBY');
    const [serverCode, setServerCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<string[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<{ text: string; time: number } | null>(null);
    const [gameMessage, setGameMessage] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [chatMessages, setChatMessages] = useState<{ name: string; message: string }[]>([]);
    const [onlinePlayers, setOnlinePlayers] = useState('0');

    const resetGame = () => {
        setGameState('LOBBY');
        setServerCode(null);
        setPlayers([]);
        setCurrentQuestion(null);
        setGameMessage(null);
        setTimeLeft(0);
        setChatMessages([]);
        setOnlinePlayers('0');
    };

    // Countdown Timer is now driven by backend 'timer_tick' messages
    // to ensure perfect synchronization across all players.

    // Parse URL params for serverCode on mount/update is now handled by the pages directly calling setServerCode
    // to ensure path-based params work correctly.

    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case 'chat_message':
                if (typeof lastMessage.message === 'object') {
                    setChatMessages(prev => [...prev, lastMessage.message as { name: string; message: string }]);
                } else {
                    setChatMessages(prev => [...prev, { name: 'Unknown', message: String(lastMessage.message) }]);
                }
                break;

            case 'online_players':
                setOnlinePlayers(lastMessage.message);
                break;

            case 'game_starting':
                setGameState('GAME_STARTING');
                if (typeof lastMessage.message === 'object') {
                    setGameMessage(lastMessage.message.text);
                    if (lastMessage.message.serverCode) {
                        setServerCode(lastMessage.message.serverCode);
                        navigate(`/game/${lastMessage.message.serverCode}`);
                    } else {
                        navigate(`/game/${serverCode}`);
                    }
                } else {
                    setGameMessage(lastMessage.message);
                    navigate(`/game/${serverCode}`);
                }
                break;

            case 'announcement':
                // "Loading the game"
                setGameMessage(lastMessage.message);
                break;

            case 'answering_phase':
                setGameState('PLAYING');
                setCurrentQuestion({
                    text: lastMessage.message.question,
                    time: Number(lastMessage.message.time)
                });
                setTimeLeft(Number(lastMessage.message.time)); // Start timer
                break;

            case 'voting_phase':
                setGameState('VOTING');
                if (typeof lastMessage.message === 'object' && 'current_players' in lastMessage.message) {
                    setPlayers(lastMessage.message.current_players);
                    setTimeLeft(Number(lastMessage.message.time));
                }
                break;

            case 'player_answer':
                if (typeof lastMessage.message === 'object' && 'sender' in lastMessage.message) {
                    const { sender, answer } = lastMessage.message as { sender: string; answer: string };
                    setChatMessages(prev => [...prev, { name: sender, message: `Answer: ${answer}` }]);
                }
                break;

            case 'timer_tick':
                setTimeLeft(Number(lastMessage.message));
                break;

            case 'game_over':
                setGameState('GAME_OVER');
                setGameMessage(lastMessage.message);
                break;

            case 'round_end':
                setGameState('ROUND_END');
                setGameMessage(typeof lastMessage.message === 'string' ? lastMessage.message : JSON.stringify(lastMessage.message));
                break;

            case 'kick_info':
            case 'human_wins':
            case 'gemini_wins':
                setGameState('SHOW_RESULT');
                setGameMessage(lastMessage.message);
                break;

            // ... handle others
        }
    }, [lastMessage, navigate, serverCode]);

    return (
        <GameContext.Provider value={{
            gameState,
            serverCode,
            players,
            currentQuestion,
            timeLeft,
            gameMessage,
            chatMessages,
            onlinePlayers,
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
