import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

// Types representing the structure of WebSocket messages
export type IncomingMessage =
    | { type: 'announce_name'; message: string }
    | { type: 'online_players'; message: string }
    | { type: 'game_starting'; message: string | { text: string; serverCode: string } }
    | { type: 'announcement'; message: string }
    | { type: 'answering_phase'; message: { question: string; time: number } }
    | { type: 'voting_phase'; message: { current_players: string[]; time: number } }
    | { type: 'round_end'; message: any }
    | { type: 'kick_info'; message: string }
    | { type: 'game_over'; message: string }
    | { type: 'human_wins'; message: string }
    | { type: 'gemini_wins'; message: string }
    | { type: 'timer_tick'; message: number }
    | { type: 'chat_message'; message: { name: string; message: string } | string }
    | { type: 'player_answer'; message: { sender: string; answer: string } | string }
    | { type: 'error'; message: string };

interface WebSocketContextType {
    connect: (serverCode: string, age: string) => void;
    disconnect: () => void;
    sendMessage: (type: string, payload: any) => void;
    lastMessage: IncomingMessage | null;
    isConnected: boolean;
    playerName: string | null;
    connectionError: string | null;
    connectionCode: number | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<IncomingMessage | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [connectionCode, setConnectionCode] = useState<number | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const connect = useCallback((serverCode: string, age: string) => {
        // Prevent duplicate connections
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (wsRef.current) {
            wsRef.current.close();
        }

        // Determine WS URL (assuming localhost for now, needs env var)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = '10.0.0.113:3000'; // Default, ideally from env
        const url = `${protocol}//${host}/?serverCode=${serverCode}&age=${age}`;

        const ws = new WebSocket(url);
        console.log(ws);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            setConnectionError(null);
            setConnectionCode(null);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WS Message:', data);
                setLastMessage(data);

                // Handle specific global updates internally if needed
                if (data.type === 'announce_name') {
                    // Extract name from message "Your game name is [Name]" if format is consistent
                    // Or just store the message. The prompt says "Your game name is ${playerInfo.name}"
                    // We might want to parse it or request backend change to send raw name. 
                    // prioritizing the prompt's instructions: "Your game name is ..."
                    // I'll parse it simply.
                    const match = data.message.match(/Your game name is (.+)/);
                    if (match) {
                        setPlayerName(match[1]);
                    }
                }
            } catch (err) {
                console.error('Failed to parse WS message', err);
            }
        };

        ws.onclose = (event) => {
            console.log('Disconnected from WebSocket', event.code, event.reason);
            setIsConnected(false);
            setPlayerName(null);
            setConnectionCode(event.code);

            if (event.code === 1011) {
                setConnectionError(event.reason || 'Lobby found but connection rejected');
            } else if (event.code === 4001) {
                setConnectionError("You were kicked from the game");
            } else if (event.code !== 1000) {
                if (event.reason) setConnectionError(event.reason);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    }, []);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const sendMessage = useCallback((type: string, message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, ...message })); // Backend expects {type, ...payload} usually ? 
            // Backend: JSON.parse(message.toString()); switch (parsedMessage.type)
            // Checks: parsedMessage.name, parsedMessage.answer, parsedMessage.vote
            // So structure should be { type: 'submit_answer', name: playerName, answer: ... }
        } else {
            console.warn('WebSocket not connected');
        }
    }, []);

    return (
        <WebSocketContext.Provider value={{ connect, disconnect, sendMessage, lastMessage, isConnected, playerName, connectionError, connectionCode }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
