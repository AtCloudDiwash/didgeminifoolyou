import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (connectionCode === 4001) {
      setKickMessage("You have been kicked from the lobby.");
    }
  }, [connectionCode]);

  useEffect(() => {
    if (lastMessage?.type === 'kick_info') {
      setKickMessage(String(lastMessage.message));
    }
  }, [lastMessage]);

  const handleCloseOverlay = () => {
    setKickMessage(null);
    if (connectionCode === 4001) {
      window.location.href = '/'; // Hard redirect to clear all states and triggers LandingPage reset
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-brand-blue selection:text-white">
      <AnimatePresence>
        {kickMessage && (
          <KickedOverlay message={kickMessage} onClose={handleCloseOverlay} />
        )}
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
