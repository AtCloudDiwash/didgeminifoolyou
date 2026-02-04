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
                    {chatMessages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-start"
                        >
                            {/* Player Name Label */}
                            <span className="text-[10px] uppercase tracking-widest text-white/20 mb-1 ml-4 font-heading">
                                {msg.name}
                            </span>

                            {/* Message Bubble */}
                            <div className="max-w-[85%] bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-3 text-white/90">
                                <p className="font-body text-base leading-relaxed">{msg.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input Section */}
            <div className="p-6 bg-[#0c0c0c] border-t border-white/5">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={gameState === 'PLAYING' ? "Write your answer ..." : "Type a message..."}
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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
            `}</style>
        </div>
    );
}
