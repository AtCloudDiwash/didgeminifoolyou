import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeroImage from '../assets/geminposter_and_callout.svg';
import { useGame } from '../context/GameContext';

export default function LandingPage() {
    const { resetGame } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    const [activeOverlay, setActiveOverlay] = useState<'create' | 'join' | null>(null);

    // Form states
    const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
    const [rounds, setRounds] = useState<4 | 6>(4);
    const [age, setAge] = useState('');
    const [serverCode, setServerCode] = useState('');

    const handleCreateServer = async () => {
        try {
            const response = await fetch('http://localhost:3000/lobbies/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty, rounds })
            });
            const data = await response.json();
            if (data.serverCode) {
                navigate(`/lobby/${data.serverCode}?age=${age}`);
            }
        } catch (error) {
            console.error("Failed to create server", error);
        }
    };

    const handleJoinServer = () => {
        if (serverCode && age) {
            navigate(`/lobby/${serverCode}?age=${age}`);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-red/10 blur-[120px] rounded-full" />
            </div>

            {/* Main Content */}
            <div className="relative z-0 flex flex-col md:flex-row items-center gap-12 md:gap-24 max-w-6xl w-full">

                {/* Left: Hero Image */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="w-80 h-80 md:w-96 md:h-96 relative group flex items-center justify-center">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full group-hover:bg-brand-red/30 transition-all duration-500" />

                        {/* Character SVG Asset */}
                        <img src={HeroImage} alt="Gemi-Poster Character" className="w-full h-full object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                    </div>
                </motion.div>

                {/* Right: Title & Actions */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center md:text-left space-y-8"
                >
                    <div className="space-y-2">
                        <h1 className="text-6xl md:text-8xl font-heading text-white tracking-wide">
                            <span className="text-brand-blue">Did </span>
                            <span className="text-white">Gemini </span>
                            <span className="text-brand-red">Fool You?</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/60 font-body max-w-lg">
                            Can you spot the AI imposter among your friends?
                            A social deduction game of wit and deception.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button
                            variant="primary"
                            size="lg"
                            className="bg-blue-500 text-white hover:bg-brand-blue/90 shadow-[0_0_30px_rgba(45,122,243,0.3)]"
                            onClick={() => setActiveOverlay('create')}
                        >
                            Create Server
                        </Button>
                        <Button
                            variant="danger"
                            size="lg"
                            className="bg-brand-red text-white hover:bg-brand-red/90 shadow-[0_0_30px_rgba(221,31,5,0.3)]"
                            onClick={() => setActiveOverlay('join')}
                        >
                            Join Server
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Modals / Overlays */}
            <AnimatePresence>
                {activeOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setActiveOverlay(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative header glow */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${activeOverlay === 'create' ? 'bg-brand-blue' : 'bg-brand-red'} shadow-[0_0_20px_currentColor]`} />

                            <h2 className="text-3xl font-heading text-white text-center">
                                {activeOverlay === 'create' ? 'Create Lobby' : 'Join Lobby'}
                            </h2>

                            {activeOverlay === 'create' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-heading text-white/60 mb-2">Difficulty</label>
                                            <div className="relative">
                                                <select
                                                    value={difficulty}
                                                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'hard')}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 focus:outline-none focus:border-brand-blue transition-colors font-heading text-lg appearance-none cursor-pointer"
                                                >
                                                    <option value="easy" className="bg-black text-white">Easy</option>
                                                    <option value="hard" className="bg-black text-white">Hard</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-heading text-white/60 mb-2">Rounds</label>
                                            <div className="relative">
                                                <select
                                                    value={rounds}
                                                    onChange={(e) => setRounds(Number(e.target.value) as 4 | 6)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 focus:outline-none focus:border-brand-blue transition-colors font-heading text-lg appearance-none cursor-pointer"
                                                >
                                                    <option value={4} className="bg-black text-white">4 Rounds</option>
                                                    <option value={6} className="bg-black text-white">6 Rounds</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-heading text-white/60 mb-2">Your Age</label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="Ex: 24"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors font-body"
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-brand-blue text-white hover:bg-brand-blue/90"
                                        onClick={handleCreateServer}
                                    >
                                        Create & Join
                                    </Button>
                                </div>
                            )}

                            {activeOverlay === 'join' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-heading text-white/60 mb-2">Server Code</label>
                                        <input
                                            type="text"
                                            value={serverCode}
                                            onChange={(e) => setServerCode(e.target.value)}
                                            placeholder="Ex: ABCD"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-brand-red transition-colors font-body text-center tracking-widest text-2xl"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-heading text-white/60 mb-2">Your Age</label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="Ex: 24"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-brand-red transition-colors font-body"
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-brand-red text-white hover:bg-brand-red/90"
                                        onClick={handleJoinServer}
                                    >
                                        Enter Game
                                    </Button>
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
