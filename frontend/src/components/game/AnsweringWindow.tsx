import { motion } from 'framer-motion';
import { useWebSocket } from '../../context/WebSocketContext';
import { useState } from 'react';

export default function AnsweringWindow() {
    const { sendMessage, playerName } = useWebSocket();
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!answer.trim()) return;
        sendMessage('submit_answer', { name: playerName, answer });
        setSubmitted(true);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111]/90 backdrop-blur border border-brand-blue/30 p-4 rounded-2xl shadow-2xl relative"
            >
                {!submitted ? (
                    <div className="flex gap-4 items-end">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            className="flex-1 h-14 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors font-body resize-none"
                        />
                        <button
                            onClick={handleSubmit}
                            className="h-14 px-8 bg-[#8b1a1a] hover:bg-[#a02020] text-white font-heading uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                            Send
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4 text-green-400 font-heading">
                        Answer sent! Waiting for others...
                    </div>
                )}
            </motion.div>
        </div>
    );
}
