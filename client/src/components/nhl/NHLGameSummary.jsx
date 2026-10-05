import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

function getResult(game, teamScore, opponentScore) {
  const won =
    Number(teamScore) > Number(opponentScore);

  const statusDetail =
    game.status?.detail?.toLowerCase() || "";

  if (statusDetail.includes("/so")) {
    return won ? "SO - W" : "SO - L";
  }

  if (statusDetail.includes("/ot")) {
    return won ? "OT - W" : "OT - L";
  }

  return won ? "W" : "L";
}

function RecentGames({ team, currentGame }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecentGames() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/nhl/team/${team.id}/schedule`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load recent games"
          );
        }

        const data = await response.json();

        const currentGameDate = new Date(
          currentGame.date
        );

        const recentGames = (data.games || [])
          .filter((game) => {
            const gameDate = new Date(game.date);

            return (
              game.status?.state === "post" &&
              game.id !== currentGame.id &&
              gameDate < currentGameDate
            );
          })
          .sort(
            (a, b) =>
              new Date(b.date) - new Date(a.date)
          )
          .slice(0, 3);

        setGames(recentGames);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecentGames();
  }, [team.id, currentGame.id, currentGame.date]);

  if (loading) {
    return <p>Loading recent games...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!games.length) {
    return (
      <p>No previous games available this season.</p>
    );
  }

  return (
    <div className="cfb-summary-recent-games">
      {games.map((game) => {
        const isAway =
          String(game.awayTeam.id) ===
          String(team.id);

        const teamScore = Number(
          isAway
            ? game.awayTeam.score
            : game.homeTeam.score
        );

        const opponent = isAway
          ? game.homeTeam
          : game.awayTeam;

        const opponentScore = Number(
          opponent.score
        );

        const result = getResult(
          game,
          teamScore,
          opponentScore
        );

        return (
          <div
            className="cfb-summary-recent-game"
            key={game.id}
          >
            <strong>{result}</strong>

            <span className="cfb-summary-recent-opponent">
              {isAway ? "at" : "vs"}

              {opponent.logo && (
                <img
                  src={opponent.logo}
                  alt={opponent.name}
                />
              )}

              {opponent.name}
            </span>

            <span>
              {teamScore}-{opponentScore}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function NHLGameSummary({ game }) {
  const venueLocation = [
    game.venue?.city,
    game.venue?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="cfb-game-summary">
      <section className="cfb-summary-info">
        <h2>Game Info</h2>

        {game.venue?.name ? (
          <div className="cfb-summary-venue">
            <strong>{game.venue.name}</strong>

            {venueLocation && (
              <span>{venueLocation}</span>
            )}
          </div>
        ) : (
          <p>
            Venue information unavailable.
          </p>
        )}
      </section>

      <section className="cfb-summary-recent">
        <h2>Recent Games</h2>

        <div className="cfb-summary-team">
          <div className="cfb-summary-team-header">
            {game.awayTeam.logo && (
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.name}
              />
            )}

            <div>
              <strong>
                {game.awayTeam.name}
              </strong>

              {game.awayTeam.record && (
                <span>
                  {game.awayTeam.record}
                </span>
              )}
            </div>
          </div>

          <RecentGames
            team={game.awayTeam}
            currentGame={game}
          />
        </div>

        <div className="cfb-summary-team">
          <div className="cfb-summary-team-header">
            {game.homeTeam.logo && (
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.name}
              />
            )}

            <div>
              <strong>
                {game.homeTeam.name}
              </strong>

              {game.homeTeam.record && (
                <span>
                  {game.homeTeam.record}
                </span>
              )}
            </div>
          </div>

          <RecentGames
            team={game.homeTeam}
            currentGame={game}
          />
        </div>
      </section>
    </div>
  );
}