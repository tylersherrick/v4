
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import GameLoadingSpinner from "../common/GameLoadingSpinner.jsx";
import CFBGamecast from "./CFBGamecast.jsx";
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
  const location = useLocation();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [playerStatTab, setPlayerStatTab] =
    useState("passing");
  const [playerStatsTeam, setPlayerStatsTeam] =
    useState("away");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const awayTeam = location.state?.awayTeam;
  const homeTeam = location.state?.homeTeam;

  useEffect(() => {
    let cancelled = false;

    async function loadGame(showLoading = false) {
      const startTime = Date.now();

      try {
        const response = await fetch(
          `${API_URL}/api/cfb/game/${gameId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load game");
        }

        const data = await response.json();

        if (showLoading) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 500 - elapsed);

          await new Promise((resolve) =>
            setTimeout(resolve, remaining)
          );
        }

        if (cancelled) {
          return;
        }

        setGame(data);
        setError("");
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
        }
      } finally {
        if (!cancelled && showLoading) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    loadGame(true);

    const interval = setInterval(() => {
      loadGame(false);
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId]);

  if (loading) {
    return (
      <GameLoadingSpinner
        awayTeam={awayTeam}
        homeTeam={homeTeam}
      />
    );
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

        {activeTab === "gamecast" && (
          <CFBGamecast gamecast={game.gamecast} />
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
