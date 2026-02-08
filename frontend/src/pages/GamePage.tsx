import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useWebSocket } from '../context/WebSocketContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import ChatWindow from '../components/game/ChatWindow';
import VotingWindow from '../components/game/VotingWindow';
import GameOverWindow from '../components/game/GameOverWindow';
import AnsweringWindow from '../components/game/AnsweringWindow';

import logo from '../assets/gemiposter.svg';

export default function GamePage() {
    const { serverCode: urlServerCode } = useParams();
    const { gameState, serverCode, currentQuestion, timeLeft, gameMessage, onlinePlayers, setServerCode } = useGame();
    const { playerName } = useWebSocket();
    const [showQuestionOverlay, setShowQuestionOverlay] = useState(false);
    const [isVotingWindowOpen, setIsVotingWindowOpen] = useState(true);

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

    // Auto-reset voting window to open when voting phase starts
    useEffect(() => {
        if (gameState === 'VOTING') {
            setIsVotingWindowOpen(true);
        }
    }, [gameState]);

    // Auto-dismiss SHOW_RESULT screen after 5 seconds to prevent freeze
    useEffect(() => {
        if (gameState === 'GEMINI_WINS') {
            const timer = setTimeout(() => {
                // Game will continue automatically from backend
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [gameState]);


    // Auto-dismiss SHOW_RESULT screen after 5 seconds to prevent freeze
    useEffect(() => {
        if (gameState === 'HUMAN_WINS') {
            const timer = setTimeout(() => {
                // Game will continue automatically from backend
            }, 5000);
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
                {gameState === 'VOTING' && isVotingWindowOpen && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur"
                    >
                        <VotingWindow onClose={() => setIsVotingWindowOpen(false)} />
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
                {gameState === 'GEMINI_WINS' && (
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
                {/* RESULT SCREEN (KICK / WINNER) */}
                {gameState === 'HUMAN_WINS' && (
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

                {/* ANNOUNCEMENT OVERLAY */}
                {gameState === 'ANNOUNCEMENT' && (
                    <motion.div
                        key="announcement"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-brand-blue/10 to-black text-center p-8"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-4xl space-y-6"
                        >
                            <div className="inline-block px-6 py-2 bg-brand-blue/20 border border-brand-blue/50 rounded-full mb-4">
                                <span className="text-brand-blue font-heading text-sm uppercase tracking-widest">Announcement</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-heading text-white mb-6 uppercase tracking-wider">
                                {gameMessage || "Important Update"}
                            </h2>
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-white/60 text-lg font-heading tracking-wide"
                            >
                                Please wait...
                            </motion.div>
                        </motion.div>
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

            {/* FLOATING VOTING TABLE BUTTON - Only visible when voting window is closed during voting phase */}
            {gameState === 'VOTING' && !isVotingWindowOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => setIsVotingWindowOpen(true)}
                    className="fixed bottom-8 right-8 z-30 px-6 py-4 bg-brand-blue hover:bg-brand-blue/80 text-white font-heading uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Voting Table
                </motion.button>
            )}

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
                            {/* <span className="whitespace-nowrap">Server Code: <span className="text-white/80">{serverCode}</span></span> */}
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

                {/* CHAT WINDOW / ANSWERING WINDOW */}
                <main className="flex-1 overflow-hidden relative bg-[#111] rounded-3xl border border-white/5 shadow-inner">
                    {(gameState === 'PLAYING' || gameState === 'GHOST_MODE') && !showQuestionOverlay ? (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                <ChatWindow />
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <AnsweringWindow />
                            </div>
                        </div>
                    ) : (
                        <ChatWindow />
                    )}
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
