import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NHLGamecast from "./NHLGamecast.jsx";
import NHLGameHeader from "./NHLGameHeader.jsx";
import NHLGameLeaders from "./NHLGameLeaders.jsx";
import NHLGameNav from "./NHLGameNav.jsx";
import NHLGameSummary from "./NHLGameSummary.jsx";
import NHLGameTabs from "./NHLGameTabs.jsx";
import NHLGameTeamStats from "./NHLGameTeamStats.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function NHLGamePage() {
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [playerStatsTeam, setPlayerStatsTeam] =
    useState("away");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(
          `${API_URL}/api/nhl/game/${gameId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load game");
        }

        const data = await response.json();

        setGame(data);
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadGame();

    const interval = setInterval(() => {
      loadGame();
    }, 3000);

    return () => clearInterval(interval);
  }, [gameId]);

  if (loading) {
    return <p>Loading NHL game...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!game) {
    return <p>Game not found.</p>;
  }

  return (
    <main className="cfb-game-page">
      <NHLGameNav />

      <NHLGameHeader game={game} />

      <NHLGameTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <section className="game-tab-content">
        {activeTab === "summary" && (
          <NHLGameSummary game={game} />
        )}

        {activeTab === "gamecast" && (
          <NHLGamecast
            gamecast={game.gamecast}
            gameStatus={game.status}
          />
        )}

        {activeTab === "teamStats" && (
          <NHLGameTeamStats game={game} />
        )}

        {activeTab === "playerStats" && (
          <p>Player stats unavailable.</p>
        )}

        {activeTab === "leaders" && (
          <NHLGameLeaders
            game={game}
            playerStatsTeam={playerStatsTeam}
            setPlayerStatsTeam={setPlayerStatsTeam}
          />
        )}
      </section>
    </main>
  );
}