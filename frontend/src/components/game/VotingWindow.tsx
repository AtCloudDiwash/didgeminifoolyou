import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useState } from 'react';

interface VotingWindowProps {
    onClose?: () => void;
}

export default function VotingWindow({ onClose }: VotingWindowProps) {
    const { players, timeLeft, kickedPlayers, gameState } = useGame();
    const { sendMessage, playerName } = useWebSocket();
    const [votedPlayer, setVotedPlayer] = useState<string | null>(null);

    // Check if current player is in ghost mode
    const isGhostMode = gameState === 'GHOST_MODE';

    // Filter out kicked players from the voting list
    const activePlayers = players.filter(player => !kickedPlayers.includes(player));

    // Use active players for display
    const displayPlayers = activePlayers.length > 0 ? activePlayers : [
        'Player 1', 'Player 2', 'Player 3',
        'Player 4', 'Player 5', 'Player 6'
    ];

    const handleVote = (targetName: string) => {
        // Prevent voting if in ghost mode
        if (isGhostMode || votedPlayer || targetName === playerName) return;
        setVotedPlayer(targetName);
        sendMessage('submit_vote', { name: playerName, vote: targetName });
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-5xl w-full">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0c0c0c] border border-white/5 p-12 rounded-[2.5rem] w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-12"
            >
                {isGhostMode ? (
                    <div className="text-center py-12 space-y-4">
                        <div className="text-white/40 font-heading text-lg uppercase tracking-widest">
                            You are in Ghost Mode
                        </div>
                        <div className="text-white/60 font-body text-base">
                            <span className="text-2xl font-bold uppercase tracking-widest text-white/80 font-heading block mt-2">
                                {playerName}
                            </span>
                        </div>
                        <div className="text-white/30 font-body text-sm mt-4">
                            You cannot vote in this mode
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-4xl font-heading text-white">Cast Your Vote</h2>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex flex-col items-center">
                                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-heading mb-0.5">Time Left</span>
                                        <span className={`text-2xl font-heading leading-none ${timeLeft <= 5 ? 'text-brand-red animate-pulse' : 'text-brand-blue'}`}>
                                            {timeLeft}s
                                        </span>
                                    </div>
                                    {onClose && (
                                        <button
                                            onClick={onClose}
                                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center text-white/40 hover:text-white/80"
                                            aria-label="Close voting window"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-white/30 font-heading tracking-widest uppercase text-sm">
                                Select the player you suspect is the <span className="text-brand-red">Gemi-Poster</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {displayPlayers.map((name, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleVote(name)}
                                    disabled={!!votedPlayer || name === playerName}
                                    whileHover={!(votedPlayer || name === playerName) ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                                    whileTap={!(votedPlayer || name === playerName) ? { scale: 0.98 } : {}}
                                    className={`relative group p-8 rounded-3xl border transition-all duration-300
                             ${votedPlayer === name
                                            ? 'bg-brand-red/10 border-brand-red text-white shadow-[0_0_30px_rgba(220,38,38,0.2)]'
                                            : 'bg-[#151515] border-white/5 text-white/50'
                                        }
                             ${votedPlayer && votedPlayer !== name ? 'opacity-30' : ''}
                             ${name === playerName ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-white/20'}
                        `}
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-heading text-lg
                                    ${votedPlayer === name ? 'bg-brand-red text-white' : 'bg-white/5 text-white/20 group-hover:bg-white/10'}
                                `}>
                                            {name[0].toUpperCase()}
                                        </div>
                                        <span className="font-heading text-xl tracking-wide">{name}</span>
                                        {name === playerName && (
                                            <span className="absolute top-3 right-3 text-[10px] text-white/20 uppercase tracking-tighter">You</span>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-4">

                            {votedPlayer && (
                                <p className="text-brand-blue font-heading tracking-widest uppercase text-xs animate-pulse">
                                    Vote synchronization in progress...
                                </p>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
