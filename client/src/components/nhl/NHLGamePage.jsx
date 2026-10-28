
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import GameLoadingSpinner from "../common/GameLoadingSpinner.jsx";
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
  const location = useLocation();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
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
          `${API_URL}/api/nhl/game/${gameId}`
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

  const isPregame =
    game.status?.state === "pre";

  return (
    <main className="cfb-game-page">
      <NHLGameNav
        gameId={gameId}
        isPregame={isPregame}
      />

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
