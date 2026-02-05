import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import { WebSocketProvider, useWebSocket } from "./context/WebSocketContext";
import { GameProvider } from "./context/GameContext";
import KickedOverlay from "./components/ui/KickedOverlay";
import { AnimatePresence } from "framer-motion";

function AppContent() {
  const { connectionCode, lastMessage } = useWebSocket();
  const [kickMessage, setKickMessage] = useState<string | null>(null);

  // Combine both kick detection logics into single useEffect
  useEffect(() => {
    // Check if user was kicked (connection closed with code 4001)
    if (connectionCode === 4001) {
      setKickMessage("You have been kicked from the lobby.");
      return;
    }

    // Check if someone else was kicked (kick_info broadcast)
    if (lastMessage?.type === 'kick_info') {
      setKickMessage(String(lastMessage.message));
    }
  }, [connectionCode, lastMessage]);

  const handleCloseOverlay = () => {
    setKickMessage(null);
    // If this player was kicked, redirect to home
    if (connectionCode === 4001) {
      window.location.href = '/';
    }
  };

  // Memoize overlay to prevent unnecessary re-renders
  const overlay = useMemo(() => {
    if (!kickMessage) return null;
    return <KickedOverlay message={kickMessage} onClose={handleCloseOverlay} />;
  }, [kickMessage, connectionCode]);

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-brand-blue selection:text-white">
      <AnimatePresence>
        {overlay}
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lobby/:serverCode" element={<LobbyPage />} />
        <Route path="/game/:serverCode" element={<GamePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;
