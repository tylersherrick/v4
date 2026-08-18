import { Link } from "react-router-dom";

export default function MLBLineups({ awayTeam, homeTeam }) {
  function renderLineup(team) {
    if (!team.lineup?.length) {
      return <p>No lineup data available.</p>;
    }

    return team.lineup.map((player) => (
      <div key={player.id}>
        <span>{player.battingOrder}. </span>

        <Link
          to={`/mlb/player/${player.id}`}
          state={{
            playerName: player.name,
            position: player.position,
          }}
        >
          {player.name}
        </Link>

        {player.position && (
          <span> {player.position}</span>
        )}
      </div>
    ));
  }

  return (
    <section>
      <h2>Starting Lineups</h2>

      <div>
        <h3>{awayTeam.name}</h3>
        {renderLineup(awayTeam)}
      </div>

      <div>
        <h3>{homeTeam.name}</h3>
        {renderLineup(homeTeam)}
      </div>
    </section>
  );
}