import { useEffect, useState } from "react";
import CFBGameCard from "../cfb/CFBGameCard";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard";

export default function CFB() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch(ESPN_URL);

        if (!response.ok) {
          throw new Error("Unable to load CFB games");
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
              rank: awayTeam?.curatedRank?.current,
            },
            homeTeam: {
              id: homeTeam?.team?.id,
              name: homeTeam?.team?.displayName,
              abbreviation: homeTeam?.team?.abbreviation,
              logo: homeTeam?.team?.logo,
              score: homeTeam?.score,
              rank: homeTeam?.curatedRank?.current,
            },
          };
        });

        const rankedGames = formattedGames.filter(
          (game) =>
            game.awayTeam.rank <= 25 ||
            game.homeTeam.rank <= 25
        );

        const statusOrder = {
          in: 0,
          pre: 1,
          post: 2,
        };

        const selectedGames = rankedGames
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
  }, []);

  if (games.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>CFB</h2>

      <div className="mlb-games-grid">
        {games.map((game) => (
          <CFBGameCard
            key={game.id}
            game={game}
          />
        ))}
      </div>
    </section>
  );
}