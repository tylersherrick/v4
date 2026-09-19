function RecentGames({ team }) {
  const games = team.recentGames || [];

  if (!games.length) {
    return (
      <p>No previous games available this season.</p>
    );
  }

  return (
    <div className="cfb-summary-recent-games">
      {games.map((game) => {
        const isAway =
          String(game.awayTeam.id) === String(team.id);

        const teamScore = Number(
          isAway
            ? game.awayTeam.score
            : game.homeTeam.score
        );

        const opponent = isAway
          ? game.homeTeam
          : game.awayTeam;

        const opponentScore = Number(opponent.score);

        const result =
          teamScore > opponentScore
            ? "W"
            : teamScore < opponentScore
              ? "L"
              : "T";

        return (
          <div
            className="cfb-summary-recent-game"
            key={game.id}
          >
            <strong>{result}</strong>

            <span>
              {isAway ? "at " : "vs "}{" "}
              {opponent.rank
                ? `#${opponent.rank} `
                : ""}
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

export default function CFBGameSummary({ game }) {
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
          <p>Venue information unavailable.</p>
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
              <strong>{game.awayTeam.name}</strong>
              {game.awayTeam.record && (
                <span>{game.awayTeam.record}</span>
              )}
            </div>
          </div>

          <RecentGames team={game.awayTeam} />
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
              <strong>{game.homeTeam.name}</strong>
              {game.homeTeam.record && (
                <span>{game.homeTeam.record}</span>
              )}
            </div>
          </div>

          <RecentGames team={game.homeTeam} />
        </div>
      </section>
    </div>
  );
}