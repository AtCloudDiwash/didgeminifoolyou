import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import GemiPoster from '../assets/gemiposter.svg';

export default function LobbyPage() {
    const { serverCode } = useParams(); // from path /lobby/:serverCode ? No, structure might differ.
    // Prompt says: "redirects to the lobby... apiRequest to a websocket end"
    // If I use path /lobby, I need to extract params.

    const [searchParams] = useSearchParams();
    const age = searchParams.get('age');

    const { connect, disconnect, connectionError } = useWebSocket();
    const { onlinePlayers, setServerCode, resetGame } = useGame();

    useEffect(() => {
        if (serverCode) {
            setServerCode(serverCode);
        }
    }, [serverCode, setServerCode]);

    useEffect(() => {
        if (serverCode && age) {
            connect(serverCode, age);
        }
        return () => {
            disconnect();
            resetGame();
        };
    }, [serverCode, age, connect, disconnect, resetGame]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
            <div className="relative z-10 space-y-8 max-w-2xl w-full">
                <h2 className="text-3xl font-heading text-white/80">Server Code:</h2>
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-7xl md:text-9xl font-heading text-white tracking-widest"
                >
                    {serverCode}
                </motion.div>

                <div className="flex flex-col items-center justify-center gap-4 mt-12">
                    {/* Character Animation - Reusing placeholder style but smaller */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-48 h-48 relative"
                    >
                        <img
                            src={GemiPoster}
                            alt="Gemi Poster"
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(45,122,243,0.6)]"
                        />
                    </motion.div>

                    {connectionError ? (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-heading text-brand-red"
                        >
                            Error: {connectionError}
                        </motion.p>
                    ) : (
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-2xl font-heading text-green-400"
                        >
                            Players Online: {onlinePlayers} <span className="inline-block animate-spin ml-2">↻</span>
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    );
}
