import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Game from './pages/Game';
import Lobby from './pages/Lobby'; // Import the Lobby component
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/game/:gameId" element={<Game />} />
      <Route path="/lobby/:serverCode" element={<Lobby />} /> {/* Add the new Lobby route */}
    </Routes>
  );
}

export default App;
