import { useParams } from "react-router-dom";

export default function CFBPlayerPage() {
  const { playerId } = useParams();

  return (
    <main className="cfb-player-page">
      <h1>CFB Player</h1>
      <p>Player ID: {playerId}</p>
    </main>
  );
}