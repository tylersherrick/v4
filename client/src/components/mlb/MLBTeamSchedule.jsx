import { Link, useSearchParams } from "react-router-dom";

export default function MLBTeamSchedule({ games, teamId }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const showFullSchedule =
    searchParams.get("full") === "true";

  if (!games?.length) {
    return <p>No schedule available.</p>;
  }

  const now = new Date();

  const completedGames = games
    .filter(
      (game) =>
        new Date(game.date) < now && game.result
    )
    .slice(-3)
    .reverse();

  const upcomingGames = games
    .filter(
      (game) =>
        new Date(game.date) >= now && !game.result
    )
    .slice(0, 3);

  function toggleFullSchedule() {
    const params = new URLSearchParams(searchParams);

    if (showFullSchedule) {
      params.delete("full");
    } else {
      params.set("full", "true");
    }

    setSearchParams(params);
  }

  function renderGame(game) {
    const gameDate = new Date(game.date);

    return (
      <Link
        key={game.id}
        to={`/mlb/game/${game.id}`}
        className="mlb-team-schedule-game"
      >
        <span className="mlb-team-schedule-date">
          {gameDate.toLocaleDateString()}
        </span>

        <span className="mlb-team-schedule-opponent">
          {game.homeAway === "home" ? "vs" : "at"}

          {game.opponent.logo && (
            <img
              src={game.opponent.logo}
              alt={game.opponent.abbreviation}
            />
          )}

          {game.opponent.abbreviation}
        </span>

        {game.result ? (
          <span className="mlb-team-schedule-result">
            {game.result}{" "}
            {game.score?.displayValue}-
            {game.opponentScore?.displayValue}
          </span>
        ) : (
          <span className="mlb-team-schedule-status">
            {gameDate.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </Link>
    );
  }

  return (
    <section className="mlb-team-schedule-section">
      <div className="mlb-team-schedule-header">
        <h2>Schedule</h2>

        <button
          className="mlb-team-schedule-toggle"
          onClick={toggleFullSchedule}
        >
          {showFullSchedule
            ? "Show Recent Schedule"
            : "View Full Schedule"}
        </button>
      </div>

      {!showFullSchedule ? (
        <>
          <div className="mlb-team-schedule-group">
            <h3>Upcoming</h3>

            {upcomingGames.length > 0 ? (
              <div className="mlb-team-schedule-games">
                {upcomingGames.map(renderGame)}
              </div>
            ) : (
              <p>No upcoming games.</p>
            )}
          </div>

          <div className="mlb-team-schedule-group">
            <h3>Recent</h3>

            {completedGames.length > 0 ? (
              <div className="mlb-team-schedule-games">
                {completedGames.map(renderGame)}
              </div>
            ) : (
              <p>No recent games.</p>
            )}
          </div>
        </>
      ) : (
        <div className="mlb-team-schedule-group">
          <h3>2026 Full Schedule</h3>

          <div className="mlb-team-schedule-games">
            {games.map(renderGame)}
          </div>
        </div>
      )}
    </section>
  );
}