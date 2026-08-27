import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSportsData } from "../../context/SportsDataContext.jsx";
import { getMLBGames } from "../../api/mlb.js";
import MLBGameCard from "./MLBGameCard.jsx";
import MLBPlayerSearch from "./MLBPlayerSearch.jsx";

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

function changeDate(date, amount) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + amount);

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MLBGames() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [date, setDate] = useState(
    searchParams.get("date") || getToday()
  );

  const {
    sportsData,
    getLeagueGames,
    setLeagueGames,
    setLeagueLoading,
    setLeagueError,
  } = useSportsData();

  const {
    games,
    loading,
    error,
  } = sportsData.mlb;

  const today = getToday();

  useEffect(() => {
    const urlDate = searchParams.get("date");

    if (urlDate && urlDate !== date) {
      setDate(urlDate);
    }
  }, [searchParams, date]);

  useEffect(() => {
    const cachedGames = getLeagueGames(
      "mlb",
      date
    );

    if (cachedGames) {
      return;
    }

    async function loadGames() {
      setLeagueLoading("mlb", true);

      try {
        const loadedGames =
          await getMLBGames(date);

        setLeagueGames(
          "mlb",
          date,
          loadedGames
        );
      } catch (error) {
        setLeagueError(
          "mlb",
          error.message
        );
      }
    }

    loadGames();
  }, [date]);

  useEffect(() => {
    if (date !== today) {
      return;
    }

    const interval = setInterval(
      async () => {
        try {
          const loadedGames =
            await getMLBGames(today);

          setLeagueGames(
            "mlb",
            today,
            loadedGames
          );
        } catch (error) {
          setLeagueError(
            "mlb",
            error.message
          );
        }
      },
      3000
    );

    return () =>
      clearInterval(interval);
  }, [date, today]);

  function updateDate(newDate) {
    setDate(newDate);

    const params =
      new URLSearchParams(searchParams);

    params.set("date", newDate);
    setSearchParams(params);
  }

  if (loading && games.length === 0) {
    return <p>Loading MLB games...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="mlb-games-page">
      <h1>MLB</h1>

      <MLBPlayerSearch />

      <section className="mlb-games-section">
        <h2>Games</h2>

        <div className="mlb-games-date-nav">
          <button
            onClick={() =>
              updateDate(
                changeDate(date, -1)
              )
            }
          >
            ←
          </button>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              updateDate(
                event.target.value
              )
            }
          />

          <button
            onClick={() =>
              updateDate(today)
            }
            disabled={date === today}
          >
            Today
          </button>

          <button
            onClick={() =>
              updateDate(
                changeDate(date, 1)
              )
            }
          >
            →
          </button>
        </div>

        <div className="mlb-games-grid">
          {games.map((game) => (
            <MLBGameCard
              key={game.id}
              game={game}
              date={date}
            />
          ))}
        </div>
      </section>
    </main>
  );
}