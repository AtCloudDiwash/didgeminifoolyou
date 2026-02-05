import React, { createContext, useContext, useRef, useCallback, useReducer } from 'react';

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
    | { type: 'ai_answer'; message: { message: string; senderName: string } }
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

// Reducer for WebSocket state
type WSState = {
    isConnected: boolean;
    lastMessage: IncomingMessage | null;
    playerName: string | null;
    connectionError: string | null;
    connectionCode: number | null;
};

type WSAction =
    | { type: 'CONNECTED' }
    | { type: 'DISCONNECTED'; code: number; reason?: string }
    | { type: 'MESSAGE_RECEIVED'; message: IncomingMessage }
    | { type: 'PLAYER_NAME_SET'; name: string }
    | { type: 'RESET' };

function wsReducer(state: WSState, action: WSAction): WSState {
    switch (action.type) {
        case 'CONNECTED':
            return {
                ...state,
                isConnected: true,
                connectionError: null,
                connectionCode: null,
            };
        case 'DISCONNECTED':
            let error = state.connectionError;
            if (action.code === 1011) {
                error = action.reason || 'Lobby found but connection rejected';
            } else if (action.code === 4001) {
                error = "You were kicked from the game";
            } else if (action.code !== 1000 && action.reason) {
                error = action.reason;
            }
            return {
                ...state,
                isConnected: false,
                playerName: null,
                connectionCode: action.code,
                connectionError: error,
            };
        case 'MESSAGE_RECEIVED':
            return {
                ...state,
                lastMessage: action.message,
            };
        case 'PLAYER_NAME_SET':
            return {
                ...state,
                playerName: action.name,
            };
        case 'RESET':
            return {
                isConnected: false,
                lastMessage: null,
                playerName: null,
                connectionError: null,
                connectionCode: null,
            };
        default:
            return state;
    }
}

const initialState: WSState = {
    isConnected: false,
    lastMessage: null,
    playerName: null,
    connectionError: null,
    connectionCode: null,
};

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(wsReducer, initialState);
    const wsRef = useRef<WebSocket | null>(null);

    const connect = useCallback((serverCode: string, age: string) => {
        // Prevent duplicate connections
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (wsRef.current) {
            wsRef.current.close();
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = '3.14.151.45:3000';
        const url = `${protocol}//${host}/?serverCode=${serverCode}&age=${age}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            dispatch({ type: 'CONNECTED' });
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WS Message:', data);

                // Dispatch message
                dispatch({ type: 'MESSAGE_RECEIVED', message: data });

                // Handle player name announcement
                if (data.type === 'announce_name') {
                    const match = data.message.match(/Your game name is (.+)/);
                    if (match) {
                        dispatch({ type: 'PLAYER_NAME_SET', name: match[1] });
                    }
                }
            } catch (err) {
                console.error('Failed to parse WS message', err);
            }
        };

        ws.onclose = (event) => {
            console.log('Disconnected from WebSocket', event.code, event.reason);
            dispatch({ type: 'DISCONNECTED', code: event.code, reason: event.reason });
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
        dispatch({ type: 'RESET' });
    }, []);

    const sendMessage = useCallback((type: string, message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, ...message }));
        } else {
            console.warn('WebSocket not connected');
        }
    }, []);

    return (
        <WebSocketContext.Provider value={{
            connect,
            disconnect,
            sendMessage,
            lastMessage: state.lastMessage,
            isConnected: state.isConnected,
            playerName: state.playerName,
            connectionError: state.connectionError,
            connectionCode: state.connectionCode
        }}>
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
