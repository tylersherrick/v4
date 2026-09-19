import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SportsNav from "../home/SportsNav.jsx";
import CFBGameCard from "./CFBGameCard.jsx";
import CFBPlayerSearch from "./CFBPlayerSearch.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const CONFERENCES = [
  ["top25", "Top 25"],
  ["acc", "ACC"],
  ["aac", "AAC"],
  ["big-12", "Big 12"],
  ["big-ten", "Big Ten"],
  ["conference-usa", "Conference USA"],
  ["mac", "MAC"],
  ["mountain-west", "Mountain West"],
  ["pac-12", "Pac-12"],
  ["sec", "SEC"],
  ["sun-belt", "Sun Belt"],
  ["independents", "FBS Independents"],
];

export default function CFBGames() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("games");
  const [games, setGames] = useState([]);
  const [season, setSeason] = useState(null);
  const [week, setWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedWeek = searchParams.get("week");
  const selectedConference =
    searchParams.get("conference") || "top25";

  useEffect(() => {
    async function loadGames() {
      try {
        const params = new URLSearchParams();

        if (selectedWeek) {
          params.set(
            "season",
            season || new Date().getFullYear()
          );
          params.set("week", selectedWeek);
        }

        if (selectedConference !== "top25") {
          params.set("conference", selectedConference);
        }

        const query = params.toString();
        const response = await fetch(
          `${API_URL}/api/cfb/games${
            query ? `?${query}` : ""
          }`
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
  }, [selectedWeek, selectedConference]);

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

  function updateConference(newConference) {
    const params = new URLSearchParams(searchParams);

    if (newConference === "top25") {
      params.delete("conference");
    } else {
      params.set("conference", newConference);
    }

    setSearchParams(params);
  }

  function goToCurrentWeek() {
    const params = new URLSearchParams(searchParams);
    params.delete("week");
    setSearchParams(params);
  }

  const currentWeekIndex = weeks.findIndex(
    (item) => item.number === week?.number
  );

  return (
    <main className="cfb-games-page">
      <SportsNav showBack />

      <h1>College Football</h1>

      <div className="cfb-games-tabs">
        <button
          className={activeTab === "games" ? "active" : ""}
          onClick={() => setActiveTab("games")}
        >
          Games
        </button>

        <button
          className={
            activeTab === "playerSearch" ? "active" : ""
          }
          onClick={() => setActiveTab("playerSearch")}
        >
          Player Search
        </button>
      </div>

      {activeTab === "games" && (
        <section className="cfb-games-section">
          <div className="cfb-games-conference-nav">
            <select
              value={selectedConference}
              onChange={(event) =>
                updateConference(event.target.value)
              }
            >
              {CONFERENCES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

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
                  key={`${item.label}-${item.number}`}
                  value={item.number}
                >
                  {item.label || `Week ${item.number}`}
                  {item.dateRange
                    ? ` · ${item.dateRange.replaceAll(
                        "Sep",
                        "Sept"
                      )}`
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

          {loading && <p>Loading CFB games...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && (
            <div className="cfb-games-grid">
              {games.map((game) => (
                <CFBGameCard
                  key={game.id}
                  game={game}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "playerSearch" && (
        <CFBPlayerSearch />
      )}
    </main>
  );
}