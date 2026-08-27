import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSportsData } from "../../context/SportsDataContext.jsx";
import { getMLBGames } from "../../api/mlb.js";
import MLBGameCard from "../mlb/MLBGameCard.jsx";

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

export default function HomePage() {
  const today = getToday();

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

  useEffect(() => {
    if (getLeagueGames("mlb", today)) {
      return;
    }

    async function loadGames() {
      setLeagueLoading("mlb", true);

      try {
        const sortedGames =
          await getMLBGames(today);

        setLeagueGames(
          "mlb",
          today,
          sortedGames
        );
      } catch (error) {
        setLeagueError(
          "mlb",
          error.message
        );
      }
    }

    loadGames();

    const interval = setInterval(
      loadGames,
      3000
    );

    return () => clearInterval(interval);
  }, [
    today,
    getLeagueGames,
    setLeagueGames,
    setLeagueLoading,
    setLeagueError,
  ]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Sports Tracker</h1>

      <section>
        <h2>
          <Link to="/mlb">MLB</Link>
        </h2>

        {loading ? (
          <p>Loading games...</p>
        ) : (
          games
            .slice(0, 3)
            .map((game) => (
              <MLBGameCard
                key={game.id}
                game={game}
                date={today}
              />
            ))
        )}
      </section>
    </main>
  );
}