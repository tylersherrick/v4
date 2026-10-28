
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import GameLoadingSpinner from "../common/GameLoadingSpinner.jsx";
import NFLGamecast from "./NFLGamecast.jsx";
import NFLGameHeader from "./NFLGameHeader.jsx";
import NFLGameLeaders from "./NFLGameLeaders.jsx";
import NFLGameNav from "./NFLGameNav.jsx";
import NFLGamePlayerStats from "./NFLGamePlayerStats.jsx";
import NFLGameSummary from "./NFLGameSummary.jsx";
import NFLGameTabs from "./NFLGameTabs.jsx";
import NFLGameTeamStats from "./NFLGameTeamStats.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function NFLGamePage() {
  const { gameId } = useParams();
  const location = useLocation();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [playerStatTab, setPlayerStatTab] =
    useState("passing");
  const [playerStatsTeam, setPlayerStatsTeam] =
    useState("away");
  const [pregameLeaders, setPregameLeaders] =
    useState({
      away: null,
      home: null,
    });
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
          `${API_URL}/api/nfl/game/${gameId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load game");
        }

        const data = await response.json();

        if (showLoading) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(
            0,
            500 - elapsed
          );

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

  useEffect(() => {
    if (
      game?.status?.state !== "pre" ||
      !game.awayTeam?.id ||
      !game.homeTeam?.id
    ) {
      return;
    }

    let cancelled = false;

    async function loadPregameLeaders() {
      try {
        const [awayResponse, homeResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/nfl/team-leaders/${game.awayTeam.id}`
            ),
            fetch(
              `${API_URL}/api/nfl/team-leaders/${game.homeTeam.id}`
            ),
          ]);

        if (!awayResponse.ok || !homeResponse.ok) {
          throw new Error(
            "Unable to load pregame leaders"
          );
        }

        const [away, home] = await Promise.all([
          awayResponse.json(),
          homeResponse.json(),
        ]);

        if (!cancelled) {
          setPregameLeaders({
            away,
            home,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      }
    }

    loadPregameLeaders();

    return () => {
      cancelled = true;
    };
  }, [
    game?.status?.state,
    game?.awayTeam?.id,
    game?.homeTeam?.id,
  ]);

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
      <NFLGameNav
        gameId={gameId}
        isPregame={isPregame}
      />

      <NFLGameHeader game={game} />

      <NFLGameTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <section className="game-tab-content">
        {activeTab === "summary" && (
          <NFLGameSummary
            game={game}
            isPregame={isPregame}
          />
        )}

        {activeTab === "gamecast" && (
          <NFLGamecast
            gamecast={game.gamecast}
          />
        )}

        {activeTab === "teamStats" && (
          <NFLGameTeamStats
            game={game}
            isPregame={isPregame}
          />
        )}

        {activeTab === "playerStats" && (
          <NFLGamePlayerStats
            game={game}
            isPregame={isPregame}
            playerStatTab={playerStatTab}
            setPlayerStatTab={setPlayerStatTab}
            playerStatsTeam={playerStatsTeam}
            setPlayerStatsTeam={setPlayerStatsTeam}
          />
        )}

        {activeTab === "leaders" && (
          <NFLGameLeaders
            game={game}
            isPregame={isPregame}
            playerStatsTeam={playerStatsTeam}
            setPlayerStatsTeam={setPlayerStatsTeam}
            pregameLeaders={pregameLeaders}
          />
        )}
      </section>
    </main>
  );
}
