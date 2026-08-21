import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MLBLinescore from "./MLBLinescore.jsx";
import MLBInjuries from "./MLBInjuries.jsx";
import MLBGameBatting from "./MLBGameBatting.jsx";
import MLBBaseMap from "./MLBBaseMap.jsx";

const API_URL = "https://v4-vqu0.onrender.com";

export default function MLBGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(
          `${API_URL}/api/mlb/game/${gameId}`
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
    return <p>Loading game...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const isPregame = game.status.state === "pre";

  const gameStatus = isPregame
    ? new Date(game.date).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : game.status.detail;

  const bases = game.liveCount?.bases || {};

  return (
    <main className="mlb-game-page">
      <div className="mlb-game-nav">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          ← Back
        </a>

        <Link to="/">← Back to Games</Link>
      </div>

      <section className="mlb-game-header">
        <h1>
          {game.awayTeam.name} at {game.homeTeam.name}
        </h1>

        <div className="mlb-game-scoreboard">
          <div className="mlb-game-team">
            <div className="mlb-game-team-info">
              {game.awayTeam.logo && (
                <img
                  src={game.awayTeam.logo}
                  alt={game.awayTeam.name}
                />
              )}

              <Link to={`/mlb/team/${game.awayTeam.id}`}>
                {game.awayTeam.abbreviation}
              </Link>
            </div>

            <strong>{game.awayTeam.score}</strong>
          </div>

          {game.liveCount && !isPregame && (
            <MLBBaseMap bases={bases} />
          )}

          <div className="mlb-game-team">
            <div className="mlb-game-team-info">
              {game.homeTeam.logo && (
                <img
                  src={game.homeTeam.logo}
                  alt={game.homeTeam.name}
                />
              )}

              <Link to={`/mlb/team/${game.homeTeam.id}`}>
                {game.homeTeam.abbreviation}
              </Link>
            </div>

            <strong>{game.homeTeam.score}</strong>
          </div>
        </div>

        <p className="mlb-game-status">
          {gameStatus}
        </p>

        {game.liveCount && (
          <div className="mlb-game-live-info">
            <div className="mlb-game-live-summary">
              <span>
                Count: {game.liveCount.balls}-
                {game.liveCount.strikes}
              </span>

              <span>
                Outs: {game.liveCount.outs}
              </span>
            </div>

            {game.liveCount.play && (
              <p className="mlb-game-last-play">
                {game.liveCount.play}
              </p>
            )}
          </div>
        )}
      </section>

      {!isPregame && (
        <section className="mlb-game-linescore">
          <MLBLinescore
            awayTeam={game.awayTeam}
            homeTeam={game.homeTeam}
          />
        </section>
      )}

      {isPregame ? (
        <MLBInjuries
          awayTeam={game.awayTeam}
          homeTeam={game.homeTeam}
        />
      ) : (
        <MLBGameBatting
          awayTeam={game.awayTeam}
          homeTeam={game.homeTeam}
        />
      )}

      <p className="mlb-game-venue">
        {game.venue.name}
        {game.venue.city &&
          ` - ${game.venue.city}`}
        {game.venue.state &&
          `, ${game.venue.state}`}
      </p>
    </main>
  );
}