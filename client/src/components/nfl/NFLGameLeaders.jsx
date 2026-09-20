import { Link } from "react-router-dom";

const PREGAME_LEADER_CATEGORIES = [
  ["passingYards", "Passing Yards"],
  ["rushingYards", "Rushing Yards"],
  ["receivingYards", "Receiving Yards"],
  ["sacks", "Sacks"],
  ["totalTackles", "Total Tackles"],
];

export default function NFLGameLeaders({
  game,
  isPregame,
  playerStatsTeam,
  setPlayerStatsTeam,
  pregameLeaders,
}) {
  const selectedPlayerTeam =
    playerStatsTeam === "away"
      ? game.awayTeam
      : game.homeTeam;

  const selectedPregameLeaders =
    pregameLeaders[playerStatsTeam];

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

        {isPregame ? (
          selectedPregameLeaders ? (
            PREGAME_LEADER_CATEGORIES.map(
              ([key, label]) => {
                const leader =
                  selectedPregameLeaders[key];

                if (!leader?.name) {
                  return null;
                }

                return (
                  <div
                    className="cfb-leader-category"
                    key={key}
                  >
                    <h3>{label}</h3>

                    <div className="cfb-leader">
                      {leader.headshot && (
                        <img
                          src={leader.headshot}
                          alt={leader.name}
                        />
                      )}

                      <div>
                        {leader.id ? (
                          <Link
                            to={`/nfl/player/${leader.id}`}
                          >
                            {leader.name}
                          </Link>
                        ) : (
                          <span>{leader.name}</span>
                        )}

                        <strong>
                          {leader.total ?? "-"}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <p>Loading leaders...</p>
          )
        ) : selectedPlayerTeam.leaders?.length >
          0 ? (
          selectedPlayerTeam.leaders
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
                    key={`${category.name}-${leader.id}`}
                  >
                    {leader.headshot && (
                      <img
                        src={leader.headshot}
                        alt={leader.name}
                      />
                    )}

                    <div>
                      <Link
                        to={`/nfl/player/${leader.id}`}
                      >
                        {leader.name}
                      </Link>

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