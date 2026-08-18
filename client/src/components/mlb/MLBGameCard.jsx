import { Link } from "react-router-dom";

export default function MLBGameCard({ game }) {
  const gameState = game.status?.state;

  const statusClass =
    gameState === "in"
      ? "live"
      : gameState === "post"
      ? "final"
      : "pregame";

  const showScore = gameState !== "pre";

  const gameTime =
    gameState === "pre"
      ? new Date(game.date).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : game.status?.detail;

  return (
    <Link
      to={`/mlb/game/${game.id}`}
      className="mlb-game-card"
    >
      <div className={`mlb-game-card-status ${statusClass}`}>
        {gameTime}
      </div>

      <div className="mlb-game-card-team">
        <div className="mlb-game-card-team-info">
          {game.awayTeam.logo && (
            <img
              src={game.awayTeam.logo}
              alt={game.awayTeam.abbreviation}
            />
          )}

          <div className="mlb-game-card-team-name">
            <span className="mlb-game-card-team-abbreviation">
              {game.awayTeam.abbreviation}
            </span>

            <span className="mlb-game-card-team-full">
              {game.awayTeam.name}
            </span>
          </div>
        </div>

        {showScore && (
          <strong>{game.awayTeam.score ?? "-"}</strong>
        )}
      </div>

      <div className="mlb-game-card-team">
        <div className="mlb-game-card-team-info">
          {game.homeTeam.logo && (
            <img
              src={game.homeTeam.logo}
              alt={game.homeTeam.abbreviation}
            />
          )}

          <div className="mlb-game-card-team-name">
            <span className="mlb-game-card-team-abbreviation">
              {game.homeTeam.abbreviation}
            </span>

            <span className="mlb-game-card-team-full">
              {game.homeTeam.name}
            </span>
          </div>
        </div>

        {showScore && (
          <strong>{game.homeTeam.score ?? "-"}</strong>
        )}
      </div>
    </Link>
  );
}