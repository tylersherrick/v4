import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CFBGameCard from "./CFBGameCard.jsx";
import CFBPlayerSearch from "./CFBPlayerSearch.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function CFBGames() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [season, setSeason] = useState(null);
  const [week, setWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedWeek = searchParams.get("week");

  useEffect(() => {
    async function loadGames() {
      try {
        const query = selectedWeek
          ? `?season=${season || new Date().getFullYear()}&week=${selectedWeek}`
          : "";

        const response = await fetch(
          `${API_URL}/api/cfb/games${query}`
        );

        if (!response.ok) {
          throw new Error("Unable to load CFB games");
        }

        const data = await response.json();

        setGames(data.games || []);
        setSeason(data.season);
        setWeek(data.week);
        setWeeks(data.weeks || []);

        if (!selectedWeek) {
          setCurrentWeek(data.week?.number);
        }

        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadGames();

    const interval = setInterval(() => {
      loadGames();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedWeek]);

  function updateWeek(newWeek) {
    const selected = weeks.find(
      (item) => item.number === newWeek
    );

    if (!selected) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("week", newWeek);
    setSearchParams(params);
  }

  function goToCurrentWeek() {
    const params = new URLSearchParams(searchParams);
    params.delete("week");
    setSearchParams(params);
  }

  if (loading) {
    return <p>Loading CFB games...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const currentWeekIndex = weeks.findIndex(
    (item) => item.number === week?.number
  );

  return (
    <main className="cfb-games-page">
      <Link to="/">← Back to Game Center</Link>
      <h1>College Football</h1>

      <CFBPlayerSearch />

      <section className="cfb-games-section">
        <h2>Games</h2>

        <div className="cfb-games-week-nav">
          <button
            onClick={() =>
              updateWeek(
                weeks[currentWeekIndex - 1]?.number
              )
            }
            disabled={currentWeekIndex <= 0}
          >
            ←
          </button>

          <select
            value={week?.number || ""}
            onChange={(event) =>
              updateWeek(Number(event.target.value))
            }
          >
            {weeks.map((item) => (
              <option
                key={item.number}
                value={item.number}
              >
                {item.label || `Week ${item.number}`}
                {item.dateRange
                  ? ` · ${item.dateRange.replaceAll("Sep", "Sept")}`
                  : ""}
              </option>
            ))}
          </select>

          <button
            className="cfb-current-week-button"
            onClick={goToCurrentWeek}
            disabled={week?.number === currentWeek}
          >
            Current Week
          </button>

          <button
            onClick={() =>
              updateWeek(
                weeks[currentWeekIndex + 1]?.number
              )
            }
            disabled={
              currentWeekIndex === -1 ||
              currentWeekIndex >= weeks.length - 1
            }
          >
            →
          </button>
        </div>

        <div className="cfb-games-grid">
          {games.map((game) => (
            <CFBGameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>
      </section>
    </main>
  );
}