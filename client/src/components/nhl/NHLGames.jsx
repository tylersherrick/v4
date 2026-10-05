import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SportsNav from "../home/SportsNav.jsx";
import NHLGameCard from "./NHLGameCard.jsx";
import NHLPlayerSearch from "./NHLPlayerSearch.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

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

function formatApiDate(date) {
  return date.replaceAll("-", "");
}

function changeDate(date, amount) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + amount);

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function NHLGames() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [date, setDate] = useState(
    searchParams.get("date") || getToday()
  );
  const [activeTab, setActiveTab] = useState("games");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlDate = searchParams.get("date");

    if (urlDate && urlDate !== date) {
      setDate(urlDate);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch(
          `${API_URL}/api/nhl/games?date=${formatApiDate(date)}`
        );

        if (!response.ok) {
          throw new Error("Unable to load NHL games");
        }

        const data = await response.json();

        const statusOrder = {
          in: 0,
          pre: 1,
          post: 2,
        };

        const sortedGames = [...(data.games || data)].sort(
          (a, b) =>
            (statusOrder[a.status?.state] ?? 1) -
            (statusOrder[b.status?.state] ?? 1)
        );

        setGames(sortedGames);
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadGames();

    if (date !== getToday()) {
      return;
    }

    const interval = setInterval(() => {
      loadGames();
    }, 3000);

    return () => clearInterval(interval);
  }, [date]);

  function updateDate(newDate) {
    setDate(newDate);

    const params = new URLSearchParams(searchParams);
    params.set("date", newDate);
    setSearchParams(params);
  }

  if (loading) {
    return <p>Loading NHL games...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const today = getToday();

  return (
    <main className="cfb-games-page">
      <SportsNav showBack />

      <h1>NHL</h1>

      <div className="game-tabs">
        <button
          onClick={() => setActiveTab("games")}
          className={activeTab === "games" ? "active" : ""}
        >
          Games
        </button>

        <button
          onClick={() => setActiveTab("playerSearch")}
          className={
            activeTab === "playerSearch" ? "active" : ""
          }
        >
          Player Search
        </button>
      </div>

      {activeTab === "games" && (
        <section className="cfb-games-section">
          <h2>Games</h2>

          <div className="mlb-games-date-nav">
            <button
              onClick={() =>
                updateDate(changeDate(date, -1))
              }
            >
              ←
            </button>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                updateDate(event.target.value)
              }
            />

            <button
              onClick={() => updateDate(today)}
              disabled={date === today}
            >
              Today
            </button>

            <button
              onClick={() =>
                updateDate(changeDate(date, 1))
              }
            >
              →
            </button>
          </div>

          <div className="cfb-games-grid">
            {games.map((game) => (
              <NHLGameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "playerSearch" && (
        <NHLPlayerSearch />
      )}
    </main>
  );
}