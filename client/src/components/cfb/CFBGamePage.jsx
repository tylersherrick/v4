import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CFBGameHeader from "./CFBGameHeader.jsx";
import CFBGameLeaders from "./CFBGameLeaders.jsx";
import CFBGameNav from "./CFBGameNav.jsx";
import CFBGamePlayerStats from "./CFBGamePlayerStats.jsx";
import CFBGameSummary from "./CFBGameSummary.jsx";
import CFBGameTabs from "./CFBGameTabs.jsx";
import CFBGameTeamStats from "./CFBGameTeamStats.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function CFBGamePage() {
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [playerStatTab, setPlayerStatTab] =
    useState("passing");
  const [playerStatsTeam, setPlayerStatsTeam] =
    useState("away");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(
          `${API_URL}/api/cfb/game/${gameId}`
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
    return <p>Loading CFB game...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!game) {
    return <p>Game not found.</p>;
  }

  const isPregame = game.status?.state === "pre";

  return (
    <main className="cfb-game-page">
      <CFBGameNav />

      <CFBGameHeader game={game} />

      <CFBGameTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <section className="game-tab-content">
        {activeTab === "summary" && (
          <CFBGameSummary
            game={game}
            isPregame={isPregame}
          />
        )}

        {activeTab === "teamStats" && (
          <CFBGameTeamStats
            game={game}
            isPregame={isPregame}
          />
        )}

        {activeTab === "playerStats" && (
          <CFBGamePlayerStats
            game={game}
            isPregame={isPregame}
            playerStatTab={playerStatTab}
            setPlayerStatTab={setPlayerStatTab}
            playerStatsTeam={playerStatsTeam}
            setPlayerStatsTeam={setPlayerStatsTeam}
          />
        )}

        {activeTab === "leaders" && (
          <CFBGameLeaders
            game={game}
            isPregame={isPregame}
            playerStatsTeam={playerStatsTeam}
            setPlayerStatsTeam={setPlayerStatsTeam}
          />
        )}
      </section>
    </main>
  );
}