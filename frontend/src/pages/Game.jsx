import React from 'react';
import { useParams } from 'react-router-dom';

const Game = () => {
  const { gameId } = useParams();

  return (
    <div>
      <h2>Game Page</h2>
      <p>Welcome to game: {gameId}</p>
    </div>
  );
};

export default Game;
