import { useParams } from 'react-router-dom';

export default function Lobby() {
  const {serverCode} = useParams();
  console.log(serverCode)
  return (
    <div className="lobby-container">
      <h2>This is lobby {serverCode}</h2>
      <p>Waiting for other players...</p>
      {/* Lobby details will go here */}
    </div>
  );
}
