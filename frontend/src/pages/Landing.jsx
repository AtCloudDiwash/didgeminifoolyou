import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateServerDialog from '../components/CreateServerDialog';
import JoinServerDialog from '../components/JoinServerDialog';

export default function Landing() {
  const [showCreateServerDialog, setShowCreateServerDialog] = useState(false);
  const [showJoinServerDialog, setShowJoinServerDialog] = useState(false);
  const [serverCode, setServerCode] = useState('');
  const navigate = useNavigate();

  const handleCreateServer = () => {
    setShowCreateServerDialog(true);
  };

  const handleCloseCreateServerDialog = () => {
    setShowCreateServerDialog(false);
  };

  const handleCreateGame = async ({ difficulty, rounds, name, age }) => {
    try {
      const response = await fetch('http://localhost:3000/lobbies/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty, rounds, name, age }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server created:', data);
      setShowCreateServerDialog(false);
      
      const wsUrl = `ws://localhost:3000?serverCode=${data.serverCode}&name=${name}&age=${age}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        navigate(`/lobby/${data.serverCode}`);
      };
  
      socket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
      };
  
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('Failed to connect to the server. Please check the server code and try again.');
      };
  
      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const handleJoinServer = () => {
    if (serverCode) {
      setShowJoinServerDialog(true);
    } else {
      alert('Please enter a server code.');
    }
  };

  const handleCloseJoinServerDialog = () => {
    setShowJoinServerDialog(false);
  };

  const handleJoinGame = ({ name, age }) => {
    const wsUrl = `ws://localhost:3000?serverCode=${serverCode}&name=${name}&age=${age}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setShowJoinServerDialog(false);
    };

    socket.onmessage = (event) => {
      const serverCode = JSON.parse(event.data).serverCode;
      console.log(event.data);
      navigate(`/lobby/${serverCode}`);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      alert('Failed to connect to the server. Please check the server code and try again.');
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  return (
    <div className="landing-container">
      <h1>Did Gemini Fool You?</h1>
      <div className="options-container">
        <div className="option">
          <button onClick={handleCreateServer}>Create Server</button>
        </div>
        <div className="option">
          <input
            type="text"
            placeholder="Enter Server Code"
            value={serverCode}
            onChange={(e) => setServerCode(e.target.value)}
          />
          <button onClick={handleJoinServer}>Join Server</button>
        </div>
      </div>
      {showCreateServerDialog && (
        <CreateServerDialog
          onClose={handleCloseCreateServerDialog}
          onCreate={handleCreateGame}
        />
      )}
      {showJoinServerDialog && (
        <JoinServerDialog
          onClose={handleCloseJoinServerDialog}
          onJoin={handleJoinGame}
        />
      )}
    </div>
  );
};
