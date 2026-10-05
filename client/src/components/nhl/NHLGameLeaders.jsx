import { Link } from "react-router-dom";

export default function NHLGameLeaders({
  game,
  playerStatsTeam,
  setPlayerStatsTeam,
}) {
  const selectedPlayerTeam =
    playerStatsTeam === "away"
      ? game.awayTeam
      : game.homeTeam;

  const selectedLeaders =
    game.leaders?.[playerStatsTeam]?.categories || [];

  return (
    <div className="cfb-leaders">
      <div className="cfb-player-stats-teams">
        <button
          className={
            playerStatsTeam === "away"
              ? "active"
              : ""
          }
          onClick={() =>
            setPlayerStatsTeam("away")
          }
        >
          {game.awayTeam.abbreviation}
        </button>

        <button
          className={
            playerStatsTeam === "home"
              ? "active"
              : ""
          }
          onClick={() =>
            setPlayerStatsTeam("home")
          }
        >
          {game.homeTeam.abbreviation}
        </button>
      </div>

      <div className="cfb-leaders-team">
        <div className="cfb-leaders-team-header">
          {selectedPlayerTeam.logo && (
            <img
              src={selectedPlayerTeam.logo}
              alt={selectedPlayerTeam.name}
            />
          )}

          <h2>{selectedPlayerTeam.name}</h2>
        </div>

        {selectedLeaders.length > 0 ? (
          selectedLeaders
            .filter(
              (category) =>
                category.leaders?.length > 0
            )
            .map((category) => (
              <div
                className="cfb-leader-category"
                key={category.name}
              >
                <h3>{category.displayName}</h3>

                {category.leaders.map((leader) => (
                  <div
                    className="cfb-leader"
                    key={`${category.name}-${leader.athlete?.id}`}
                  >
                    {leader.athlete?.headshot && (
                      <img
                        src={leader.athlete.headshot}
                        alt={leader.athlete.name}
                      />
                    )}

                    <div>
                      {leader.athlete?.id ? (
                        <Link
                          to={`/nhl/player/${leader.athlete.id}`}
                        >
                          {leader.athlete.name}
                        </Link>
                      ) : (
                        <span>
                          {leader.athlete?.name}
                        </span>
                      )}

                      <strong>
                        {leader.value ?? "-"}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ))
        ) : (
          <p>No leaders available.</p>
        )}
      </div>
    </div>
  );
}