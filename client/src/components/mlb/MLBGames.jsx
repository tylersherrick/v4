
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SportsNav from "../home/SportsNav.jsx";
import MLBGameCard from "./MLBGameCard.jsx";
import MLBPlayerSearch from "./MLBPlayerSearch.jsx";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import "../../styles/loading.css";

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

export default function MLBGames() {
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
    let cancelled = false;

    async function loadGames(showLoading = false) {
      const startTime = Date.now();

      try {
        const response = await fetch(
          `${API_URL}/api/mlb/games?date=${formatApiDate(date)}`
        );

        if (!response.ok) {
          throw new Error("Unable to load games");
        }

        const data = await response.json();

        const statusOrder = {
          in: 0,
          pre: 1,
          post: 2,
        };

        const sortedGames = [...data].sort(
          (a, b) =>
            (statusOrder[a.status?.state] ?? 1) -
            (statusOrder[b.status?.state] ?? 1)
        );

        if (showLoading) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 1500 - elapsed);

          await new Promise((resolve) =>
            setTimeout(resolve, remaining)
          );
        }

        if (cancelled) {
          return;
        }

        setGames(sortedGames);
        setError("");
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
        }
      } finally {
        if (!cancelled && showLoading) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    loadGames(true);

    if (date !== getToday()) {
      return () => {
        cancelled = true;
      };
    }

    const interval = setInterval(() => {
      loadGames(false);
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [date]);

  function updateDate(newDate) {
    setDate(newDate);

    const params = new URLSearchParams(searchParams);
    params.set("date", newDate);
    setSearchParams(params);
  }

  if (loading) {
    return <LoadingSpinner message="Loading MLB games..." />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const today = getToday();

  return (
    <main className="mlb-games-page">
      <SportsNav showBack />

      <h1>MLB</h1>

      <div className="game-tabs">
        <button
          onClick={() => setActiveTab("games")}
          className={activeTab === "games" ? "active" : ""}
        >
          Games
        </button>

        <button
          onClick={() =>
            setActiveTab("playerSearch")
          }
          className={
            activeTab === "playerSearch" ? "active" : ""
          }
        >
          Player Search
        </button>
      </div>

      {activeTab === "games" && (
        <section className="mlb-games-section">
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
      )}

      {activeTab === "playerSearch" && (
        <MLBPlayerSearch />
      )}
    </main>
  );
}
