import { Link } from "react-router-dom";

export default function MLBRoster({ players }) {
  if (!players?.length) {
    return <p>No roster available.</p>;
  }

  return (
    <section>
      <h2>Roster</h2>

      {players.map((player) => (
        <div key={player.id}>
          <Link
            to={`/mlb/player/${player.id}`}
            state={{
              playerName: player.name,
              position: player.position?.abbreviation || null,
              jersey: player.jersey || null,
              headshot: player.headshot || null,
            }}
          >
            {player.name}
          </Link>

          {player.position?.abbreviation && (
            <span> {player.position.abbreviation}</span>
          )}

          {player.jersey && <span> #{player.jersey}</span>}
        </div>
      ))}
    </section>
  );
}