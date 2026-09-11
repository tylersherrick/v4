import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function NFLPlayerSearch() {
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
        `${API_URL}/api/nfl/players/search?q=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        throw new Error("Unable to search players");
      }

      const data = await response.json();
      setPlayers(data || []);
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
          placeholder="Search NFL players"
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
              to={`/nfl/player/${player.id}`}
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