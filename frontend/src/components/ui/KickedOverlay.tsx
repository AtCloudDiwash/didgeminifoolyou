import { motion } from 'framer-motion';

interface KickedOverlayProps {
    message: string;
    onClose: () => void;
}

export default function KickedOverlay({ message, onClose }: KickedOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#111] border border-brand-red p-12 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(221,31,5,0.2)] text-center space-y-8"
            >
                <div className="w-24 h-24 bg-brand-red/20 rounded-full flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DD1F05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-heading text-white">Lobby Updated</h2>
                    <p className="text-xl text-white/70 font-heading leading-relaxed">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-brand-red text-white py-4 rounded-2xl font-heading text-xl shadow-[0_0_20px_rgba(221,31,5,0.3)] hover:bg-brand-red/90 transition-all active:scale-95"
                >
                    Acknowledge
                </button>
            </motion.div>
        </motion.div>
    );
}
