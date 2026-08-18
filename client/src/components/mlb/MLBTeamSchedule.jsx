import { Link } from "react-router-dom";

export default function MLBTeamSchedule({ games, teamId }) {
  if (!games?.length) {
    return <p>No schedule available.</p>;
  }

  const now = new Date();

  const completedGames = games
    .filter((game) => new Date(game.date) < now && game.result)
    .slice(-3)
    .reverse();

  const upcomingGames = games
    .filter((game) => new Date(game.date) >= now && !game.result)
    .slice(0, 3);

  function renderGame(game) {
    return (
      <div key={game.id}>
        <Link to={`/mlb/game/${game.id}`}>
          {new Date(game.date).toLocaleDateString()}
        </Link>

        <span>
          {" "}
          {game.homeAway === "home" ? "vs" : "at"}{" "}
          {game.opponent.abbreviation}
        </span>

        {game.result && (
          <span>
            {" "}
            {game.result} {game.score}-{game.opponentScore}
          </span>
        )}

        {!game.result && game.status?.detail && (
          <span> {game.status.detail}</span>
        )}
      </div>
    );
  }

  return (
    <section>
      <h2>Schedule</h2>

      <h3>Upcoming</h3>
      {upcomingGames.length > 0 ? (
        upcomingGames.map(renderGame)
      ) : (
        <p>No upcoming games.</p>
      )}

      <h3>Recent</h3>
      {completedGames.length > 0 ? (
        completedGames.map(renderGame)
      ) : (
        <p>No recent games.</p>
      )}

      <Link to={`/mlb/team/${teamId}/schedule`}>
        View Full Schedule
      </Link>
    </section>
  );
}