import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SportsNav from "../home/SportsNav.jsx";
import NFLGameCard from "./NFLGameCard.jsx";
import NFLPlayerSearch from "./NFLPlayerSearch.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

export default function NFLGames() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [season, setSeason] = useState(null);
  const [week, setWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedWeek = searchParams.get("week");
  const selectedSeasonType = searchParams.get("seasonType");

  useEffect(() => {
    async function loadGames() {
      try {
        const params = new URLSearchParams();

        if (selectedWeek && selectedSeasonType) {
          params.set(
            "season",
            season || new Date().getFullYear()
          );
          params.set("week", selectedWeek);
          params.set("seasonType", selectedSeasonType);
        }

        const query = params.toString()
          ? `?${params.toString()}`
          : "";

        const response = await fetch(
          `${API_URL}/api/nfl/games${query}`
        );

        if (!response.ok) {
          throw new Error("Unable to load NFL games");
        }

        const data = await response.json();

        setGames(data.games || []);
        setSeason(data.season);
        setWeek(data.week);
        setWeeks(data.weeks || []);

        if (!selectedWeek || !selectedSeasonType) {
          setCurrentWeek({
            number: data.week?.number,
            seasonType: data.seasonType,
          });
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
  }, [selectedWeek, selectedSeasonType]);

  function updateWeek(selected) {
    if (!selected) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("week", selected.number);
    params.set("seasonType", selected.seasonType);

    setSearchParams(params);
  }

  function goToCurrentWeek() {
    const params = new URLSearchParams(searchParams);

    params.delete("week");
    params.delete("seasonType");

    setSearchParams(params);
  }

  if (loading) {
    return <p>Loading NFL games...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const currentWeekIndex = weeks.findIndex(
    (item) =>
      item.number === week?.number &&
      item.seasonType === week?.seasonType
  );

  const selectedValue =
    week?.number && week?.seasonType
      ? `${week.seasonType}-${week.number}`
      : "";

  const isCurrentWeek =
    week?.number === currentWeek?.number &&
    week?.seasonType === currentWeek?.seasonType;

  return (
    <main className="cfb-games-page">
      <SportsNav showBack />
      <h1>NFL</h1>

      <NFLPlayerSearch />

      <section className="cfb-games-section">
        <h2>Games</h2>

        <div className="cfb-games-week-nav">
          <button
            onClick={() =>
              updateWeek(weeks[currentWeekIndex - 1])
            }
            disabled={currentWeekIndex <= 0}
          >
            ←
          </button>

          <select
            value={selectedValue}
            onChange={(event) => {
              const [seasonType, weekNumber] =
                event.target.value.split("-");

              const selected = weeks.find(
                (item) =>
                  item.seasonType === Number(seasonType) &&
                  item.number === Number(weekNumber)
              );

              updateWeek(selected);
            }}
          >
            {weeks.map((item) => (
              <option
                key={`${item.seasonType}-${item.number}`}
                value={`${item.seasonType}-${item.number}`}
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
            disabled={isCurrentWeek}
          >
            Current Week
          </button>

          <button
            onClick={() =>
              updateWeek(weeks[currentWeekIndex + 1])
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
            <NFLGameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>
      </section>
    </main>
  );
}