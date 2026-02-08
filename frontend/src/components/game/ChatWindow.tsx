import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow() {
    const { chatMessages, gameState } = useGame();
    const { sendMessage, playerName } = useWebSocket();
    const [message, setMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSend = () => {
        if (!message.trim()) return;

        if (gameState === 'PLAYING') {
            sendMessage('submit_answer', { name: playerName, answer: message });
        } else {
            sendMessage('chat_message', { name: playerName, message });
        }

        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-full bg-[#111]">
            {/* Scrollable Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
            >
                <AnimatePresence initial={false}>
                    {chatMessages.map((msg, idx) => {
                        const isSystem = msg.name === 'SYSTEM';

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${isSystem ? 'items-center my-4' : 'items-start'}`}
                            >
                                {/* Player Name Label - Hide for system messages */}
                                {!isSystem && (
                                    <span className="text-sm font-bold uppercase tracking-widest text-white/80 mb-1 ml-4 font-heading">
                                        {msg.name}
                                    </span>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`
                        ${isSystem
                                            ? 'bg-brand-red/20 border-brand-red text-brand-red font-bold uppercase tracking-wider text-center w-full'
                                            : 'max-w-[85%] bg-[#1a1a1a] border-white/5 text-white/90'
                                        } 
                        border rounded-2xl px-6 py-3
                    `}
                                >
                                    <p className="font-body text-base leading-relaxed">{msg.message}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Input Section - Hide during PLAYING state (AnsweringWindow handles it) and GHOST_MODE */}
            {gameState !== 'PLAYING' && gameState !== 'GHOST_MODE' && (
                <div className="p-6 bg-[#0c0c0c] border-t border-white/5">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-[#1a1a1a] border-none rounded-2xl px-8 py-4 text-white placeholder-white/10 focus:ring-1 focus:ring-brand-blue/30 transition-all font-body text-lg"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-[#8b1a1a] hover:bg-[#a02020] text-white font-heading uppercase tracking-widest px-10 py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            disabled={!message.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
            `}</style>
        </div>
    );
}
