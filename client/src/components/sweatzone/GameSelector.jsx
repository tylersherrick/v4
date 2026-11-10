
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const leagues = [
  { id: "mlb", label: "MLB" },
  { id: "nfl", label: "NFL" },
  { id: "cfb", label: "CFB" },
  { id: "nhl", label: "NHL" },
];

function getToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}-${month}-${day}`;
}

export default function GameSelector({ onGameSelect }) {
  const [league, setLeague] = useState("nhl");
  const [date, setDate] = useState(getToday);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      setLoading(true);
      setError("");
      setSelectedGame(null);
      setGames([]);

      try {
        const formattedDate = date.replaceAll("-", "");
        const response = await fetch(
          `${API_URL}/api/${league}/games?date=${formattedDate}`
        );

        if (!response.ok) {
          throw new Error("Unable to load games");
        }

        const data = await response.json();

        if (!cancelled) {
          const sortedGames = [...(data.games || data)].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );

          setGames(sortedGames);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [league, date]);

  function selectGame(game) {
    setSelectedGame(game.id);
    onGameSelect?.({ ...game, league });
  }

  return (
    <section className="sweatzone-game-selector">
      <h2>Choose a Game</h2>

      <div className="sweatzone-leagues">
        {leagues.map((item) => (
          <button
            key={item.id}
            type="button"
            className={league === item.id ? "active" : ""}
            onClick={() => setLeague(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mlb-games-date-nav">
        <button
          type="button"
          onClick={() => {
            const previous = new Date(`${date}T12:00:00`);
            previous.setDate(previous.getDate() - 1);
            setDate(previous.toLocaleDateString("en-CA"));
          }}
        >
          ←
        </button>

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <button
          type="button"
          onClick={() => setDate(getToday())}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => {
            const next = new Date(`${date}T12:00:00`);
            next.setDate(next.getDate() + 1);
            setDate(next.toLocaleDateString("en-CA"));
          }}
        >
          →
        </button>
      </div>

      {loading && <p>Loading games...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p>No games scheduled for this date.</p>
      )}

      <div className="sweatzone-games">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            className={`sweatzone-game-card ${
              selectedGame === game.id ? "selected" : ""
            }`}
            onClick={() => selectGame(game)}
          >
            <div className="sweatzone-game-teams">
              <div>
                {game.awayTeam?.logo && (
                  <img
                    src={game.awayTeam.logo}
                    alt={game.awayTeam.abbreviation}
                  />
                )}
                <span>{game.awayTeam?.abbreviation}</span>
              </div>

              <span>@</span>

              <div>
                {game.homeTeam?.logo && (
                  <img
                    src={game.homeTeam.logo}
                    alt={game.homeTeam.abbreviation}
                  />
                )}
                <span>{game.homeTeam?.abbreviation}</span>
              </div>
            </div>

            <small>
              {game.status?.state === "pre"
                ? new Date(game.date).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : game.status?.detail}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}
