import { useState } from "react";
import { Link } from "react-router-dom";

export default function MLBPlayerSearch() {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:3000/api/mlb/players/search?name=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        throw new Error("Unable to search players");
      }

      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <section className="mlb-player-search">
      <h2>Player Search</h2>

      <form
        className="mlb-player-search-form"
        onSubmit={handleSearch}
      >
        <input
          className="mlb-player-search-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Search MLB players"
        />

        <button
          className="mlb-player-search-button"
          type="submit"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mlb-player-search-error">
          {error}
        </p>
      )}

      {players.length > 0 && (
        <div className="mlb-player-search-results">
          {players.map((player) => (
            <Link
              key={player.id}
              to={`/mlb/player/${player.id}`}
              state={{
                playerName: player.name,
                team: player.team,
                headshot: player.headshot,
              }}
              className="mlb-player-search-result"
            >
              {player.headshot && (
                <img
                  src={player.headshot}
                  alt={player.name}
                />
              )}

              <div>
                <strong>{player.name}</strong>

                {player.team && (
                  <span>{player.team}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}