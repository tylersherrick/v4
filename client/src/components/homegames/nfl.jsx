import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NFLGameCard from "../nfl/NFLGameCard";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

export default function NFL() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch(ESPN_URL);

        if (!response.ok) {
          throw new Error("Unable to load NFL games");
        }

        const data = await response.json();

        const formattedGames = data.events.map((event) => {
          const competition = event.competitions?.[0];

          const awayTeam = competition?.competitors?.find(
            (team) => team.homeAway === "away"
          );

          const homeTeam = competition?.competitors?.find(
            (team) => team.homeAway === "home"
          );

          return {
            id: event.id,
            date: event.date,
            status: {
              state: event.status?.type?.state,
              detail: event.status?.type?.detail,
            },
            awayTeam: {
              id: awayTeam?.team?.id,
              name: awayTeam?.team?.displayName,
              abbreviation: awayTeam?.team?.abbreviation,
              logo: awayTeam?.team?.logo,
              score: awayTeam?.score,
            },
            homeTeam: {
              id: homeTeam?.team?.id,
              name: homeTeam?.team?.displayName,
              abbreviation: homeTeam?.team?.abbreviation,
              logo: homeTeam?.team?.logo,
              score: homeTeam?.score,
            },
          };
        });

        const statusOrder = {
          in: 0,
          pre: 1,
          post: 2,
        };

        const selectedGames = formattedGames
          .sort(
            (a, b) =>
              (statusOrder[a.status?.state] ?? 1) -
              (statusOrder[b.status?.state] ?? 1)
          )
          .slice(0, 3);

        setGames(selectedGames);
      } catch (error) {
        console.error(error);
      }
    }

    loadGames();

    const interval = setInterval(() => {
      loadGames();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (games.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>
        <Link to="/nfl">NFL</Link>
      </h2>

      <div className="mlb-games-grid">
        {games.map((game) => (
          <NFLGameCard
            key={game.id}
            game={game}
          />
        ))}
      </div>
    </section>
  );
}