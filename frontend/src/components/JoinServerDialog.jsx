import React, { useState } from 'react';

export default function JoinServerDialog({ onClose, onJoin }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = () => {
    if (name && age) {
      onJoin({ name, age });
      onClose();
    } else {
      alert('Please enter your name and age.');
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Join Server</h2>
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
        <button onClick={handleSubmit}>Next</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
