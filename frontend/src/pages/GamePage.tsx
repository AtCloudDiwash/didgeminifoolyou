import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useWebSocket } from '../context/WebSocketContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import ChatWindow from '../components/game/ChatWindow';
import VotingWindow from '../components/game/VotingWindow';
import GameOverWindow from '../components/game/GameOverWindow';

import logo from '../assets/gemiposter.svg';

export default function GamePage() {
    const { serverCode: urlServerCode } = useParams();
    const { gameState, serverCode, currentQuestion, timeLeft, gameMessage, onlinePlayers, setServerCode } = useGame();
    const { playerName } = useWebSocket();
    const [showQuestionOverlay, setShowQuestionOverlay] = useState(false);

    // Sync context serverCode with URL param
    useEffect(() => {
        if (urlServerCode && urlServerCode !== serverCode) {
            setServerCode(urlServerCode);
        }
    }, [urlServerCode, serverCode, setServerCode]);

    // Effect to trigger 3-second Question Overlay when entering PLAYING state
    useEffect(() => {
        if (gameState === 'PLAYING') {
            setShowQuestionOverlay(true);
            const timer = setTimeout(() => setShowQuestionOverlay(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    // Extract online count components "X/Y" -> "X"
    const onlineCountStr = onlinePlayers.includes('/') ? onlinePlayers.split('/')[0] : onlinePlayers;
    const maxPlayersStr = onlinePlayers.includes('/') ? onlinePlayers.split('/')[1] : null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-hidden relative font-body text-white flex flex-col items-center">
            <AnimatePresence mode="wait">
                {/* GAME STARTING OVERLAY */}
                {gameState === 'GAME_STARTING' && (
                    <motion.div
                        key="starting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-center space-y-8"
                        >
                            <h2 className="text-4xl md:text-6xl font-heading text-brand-blue tracking-wide">
                                {gameMessage || "Game Starting..."}
                            </h2>
                            <div className="w-20 h-20 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
                        </motion.div>
                    </motion.div>
                )}

                {/* QUESTION REVEAL OVERLAY (Lasts 3 seconds) */}
                {showQuestionOverlay && (
                    <motion.div
                        key="question-reveal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-40 flex items-center justify-center bg-black/95 backdrop-blur-md p-8 text-center"
                    >
                        <div className="space-y-6 max-w-4xl">
                            <h3 className="text-brand-blue font-heading text-2xl uppercase tracking-widest">Incoming Question</h3>
                            <p className="text-4xl md:text-6xl font-heading text-white leading-tight">
                                {currentQuestion?.text}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* VOTING OVERLAY */}
                {gameState === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur"
                    >
                        <VotingWindow />
                    </motion.div>
                )}

                {/* ROUND END SCREEN */}
                {gameState === 'ROUND_END' && (
                    <motion.div
                        key="round-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 text-center p-8"
                    >
                        <h2 className="text-5xl font-heading text-brand-blue mb-8">Round Ended</h2>
                        <div className="text-2xl text-white/80 max-w-2xl">
                            Waiting for next round...
                        </div>
                    </motion.div>
                )}

                {/* RESULT SCREEN (KICK / WINNER) */}
                {gameState === 'SHOW_RESULT' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-center p-8"
                    >
                        <h2 className="text-5xl font-heading text-white mb-6 uppercase tracking-wider text-brand-red">
                            Game Update
                        </h2>
                        <p className="text-3xl text-white/90 font-heading max-w-3xl leading-relaxed">
                            {gameMessage}
                        </p>
                    </motion.div>
                )}

                {/* GAME OVER SCREEN */}
                {gameState === 'GAME_OVER' && (
                    <motion.div
                        key="gameover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    >
                        <GameOverWindow />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTAINER */}
            <div className="w-full max-w-5xl h-screen flex flex-col p-6 pt-10">

                {/* HEADER SECTION */}
                <header className="grid grid-cols-[100px_1fr_180px] items-start gap-4 mb-10 px-4 w-full">
                    {/* Character Logo - Stable anchor */}
                    <div className="flex justify-start">
                        <img
                            src={logo}
                            alt="Gemini Icon"
                            className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)] object-contain"
                        />
                    </div>

                    {/* Question Content - Centered and fully visible */}
                    <div className="text-center min-w-0 pt-2">
                        <h2 className="text-2xl md:text-3xl font-heading text-white tracking-wide leading-tight px-4">
                            Question: {currentQuestion?.text || "Wait for it..."}
                        </h2>
                        <div className="text-sm font-heading tracking-widest text-white/30 uppercase mt-3 flex justify-center gap-8">
                            <span className="whitespace-nowrap">Server Code: <span className="text-white/80">{serverCode}</span></span>
                            <span className="whitespace-nowrap">Online: <span className="text-brand-blue/80">{onlineCountStr}{maxPlayersStr ? `/${maxPlayersStr}` : ''} Players</span></span>
                        </div>
                    </div>

                    {/* Timer - Stable width to prevent horizontal shifts */}
                    <div className="text-right pt-2 overflow-hidden">
                        <div className="text-xl md:text-2xl font-heading tabular-nums whitespace-nowrap bg-white/5 px-4 py-2 rounded-xl border border-white/5 inline-block">
                            <span className="text-white/40 mr-2 text-sm uppercase tracking-tighter">Time Left</span>
                            <span className={timeLeft <= 10 ? 'text-brand-red' : 'text-green-500'}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>
                </header>

                {/* CHAT WINDOW */}
                <main className="flex-1 overflow-hidden relative bg-[#111] rounded-3xl border border-white/5 shadow-inner">
                    <ChatWindow />
                </main>

                {/* PLAYER LABEL */}
                <footer className="mt-4 px-2">
                    <p className="text-lg font-heading text-white tracking-widest flex items-center gap-2">
                        <span className="text-white/30 lowercase italic">Your game name:</span>
                        <span className="text-white">{playerName}</span>
                    </p>
                </footer>
            </div>
        </div>
    );
}
