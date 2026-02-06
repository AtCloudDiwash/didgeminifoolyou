import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export default function GameOverWindow() {
    const { gameMessage } = useGame();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl w-full">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111] border border-brand-red p-12 rounded-3xl w-full shadow-[0_0_50px_rgba(221,31,5,0.3)] space-y-8"
            >
                <h2 className="text-5xl font-heading text-white">Game Over</h2>

                <p className="text-xl text-white/80 font-body leading-relaxed">
                    {gameMessage || "Thanks for playing!"}
                </p>

                <Button onClick={() => navigate('/')} variant="primary" className="mt-8">
                    Back to Home
                </Button>
            </motion.div>
        </div>
    );
}
