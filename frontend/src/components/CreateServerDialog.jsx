import React, { useState } from 'react';

export default function CreateServerDialog({ onClose, onCreate }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [rounds, setRounds] = useState(5);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = () => {
    if (name && age) {
      onCreate({ difficulty, rounds, name, age });
      onClose();
    } else {
      alert('Please enter your name and age.');
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Create Server</h2>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Difficulty:</label>
          <label>
            <input
              type="radio"
              value="easy"
              checked={difficulty === 'easy'}
              onChange={() => setDifficulty('easy')}
            />
            Easy
          </label>
          <label>
            <input
              type="radio"
              value="hard"
              checked={difficulty === 'hard'}
              onChange={() => setDifficulty('hard')}
            />
            Hard
          </label>
        </div>
        <div className="form-group">
          <label>Rounds:</label>
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value)))}
            min="1"
          />
        </div>
        <button onClick={handleSubmit}>Next</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
