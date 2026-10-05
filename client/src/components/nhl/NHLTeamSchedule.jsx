import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const TIME_ZONE = "America/Chicago";

function getResult(game, teamScore, opponentScore) {
  if (
    game.status?.state !== "post" ||
    teamScore === null ||
    opponentScore === null
  ) {
    return null;
  }

  const won =
    Number(teamScore) > Number(opponentScore);

  const detail =
    game.status?.detail?.toUpperCase() || "";

  if (
    detail.includes("/SO") ||
    detail.includes("SHOOTOUT")
  ) {
    return won ? "SO - W" : "SO - L";
  }

  if (
    detail.includes("/OT") ||
    detail.includes("OVERTIME")
  ) {
    return won ? "OT - W" : "OT - L";
  }

  return won ? "W" : "L";
}

export default function NHLTeamSchedule({ teamId }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await fetch(
          `${API_URL}/api/nhl/team/${teamId}/schedule`
        );

        if (!response.ok) {
          throw new Error("Unable to load team schedule");
        }

        const data = await response.json();

        const games = await Promise.all(
          data.games.map(async (game) => {
            const gameDate = new Date(game.date);
            const now = new Date();

            const isToday =
              gameDate.toLocaleDateString("en-CA", {
                timeZone: TIME_ZONE,
              }) ===
              now.toLocaleDateString("en-CA", {
                timeZone: TIME_ZONE,
              });

            if (!isToday || game.status?.completed) {
              return game;
            }

            try {
              const gameResponse = await fetch(
                `${API_URL}/api/nhl/game/${game.id}`
              );

              if (!gameResponse.ok) {
                return game;
              }

              const liveGame = await gameResponse.json();

              return {
                ...game,
                status: liveGame.status,
                awayTeam: {
                  ...game.awayTeam,
                  score: liveGame.awayTeam?.score,
                },
                homeTeam: {
                  ...game.homeTeam,
                  score: liveGame.homeTeam?.score,
                },
              };
            } catch {
              return game;
            }
          })
        );

        setSchedule({
          ...data,
          games,
        });

        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();

    const interval = setInterval(() => {
      loadSchedule();
    }, 3000);

    return () => clearInterval(interval);
  }, [teamId]);

  if (loading) {
    return <p>Loading schedule...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!schedule?.games?.length) {
    return <p>No games found.</p>;
  }

  return (
    <section className="cfb-team-schedule">
      {schedule.games.map((game) => {
        const gameDate = new Date(game.date);

        const formattedDate = gameDate
          .toLocaleDateString("en-US", {
            timeZone: TIME_ZONE,
            month: "short",
            day: "numeric",
          })
          .replace("Sep ", "Sept ");

        const formattedTime = gameDate.toLocaleTimeString(
          "en-US",
          {
            timeZone: TIME_ZONE,
            hour: "numeric",
            minute: "2-digit",
          }
        );

        const isHome =
          String(game.homeTeam.id) === String(teamId);

        const opponent = isHome
          ? game.awayTeam
          : game.homeTeam;

        const team = isHome
          ? game.homeTeam
          : game.awayTeam;

        const isFinal =
          game.status?.state === "post";

        const isLive =
          game.status?.state === "in";

        const isTBD =
          game.status?.detail
            ?.toLowerCase()
            .includes("tbd");

        const teamScore = team.score;
        const opponentScore = opponent.score;

        const result = getResult(
          game,
          teamScore,
          opponentScore
        );

        return (
          <Link
            key={game.id}
            to={`/nhl/game/${game.id}`}
            className="cfb-team-schedule-game"
          >
            <div className="cfb-team-schedule-date">
              <strong>{formattedDate}</strong>
            </div>

            <div className="cfb-team-schedule-opponent">
              <span>{isHome ? "vs" : "at"}</span>

              {opponent.logo && (
                <img
                  src={opponent.logo}
                  alt={opponent.name}
                />
              )}

              <strong>
                {opponent.abbreviation}
              </strong>
            </div>

            <div className="cfb-team-schedule-result">
              {isFinal && (
                <>
                  {result && (
                    <strong>{result}</strong>
                  )}

                  <span>
                    {teamScore}-{opponentScore}
                  </span>
                </>
              )}

              {isLive && (
                <>
                  <strong>
                    {teamScore}-{opponentScore}
                  </strong>

                  <span>
                    - {game.status?.detail || "Live"}
                  </span>
                </>
              )}

              {!isFinal && !isLive && (
                <span>
                  {isTBD ? "TBD" : formattedTime}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </section>
  );
}