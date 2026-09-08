import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const TIME_ZONE = "America/Chicago";

function getDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}${month}${day}`;
}

function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

const TEAM_STATS = [
  ["firstDowns", "First Downs"],
  ["thirdDownEff", "3rd Down"],
  ["fourthDownEff", "4th Down"],
  ["totalYards", "Total Yards"],
  ["netPassingYards", "Passing Yards"],
  ["completionAttempts", "Completions / Attempts"],
  ["yardsPerPass", "Yards Per Pass"],
  ["rushingYards", "Rushing Yards"],
  ["rushingAttempts", "Rushing Attempts"],
  ["yardsPerRushAttempt", "Yards Per Rush"],
  ["totalPenaltiesYards", "Penalties"],
  ["turnovers", "Turnovers"],
  ["fumblesLost", "Fumbles Lost"],
  ["interceptions", "Interceptions"],
  ["possessionTime", "Possession"],
];

export default function CFBGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(
          `${API_URL}/api/cfb/game/${gameId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load game");
        }

        const data = await response.json();

        setGame(data);
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadGame();

    const interval = setInterval(() => {
      loadGame();
    }, 3000);

    return () => clearInterval(interval);
  }, [gameId]);

  if (loading) {
    return <p>Loading CFB game...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!game) {
    return <p>Game not found.</p>;
  }

  const isPregame = game.status?.state === "pre";
  const isLive = game.status?.state === "in";

  const gameDate = new Date(game.date);

  const isToday =
    getDateKey(gameDate) === getDateKey(new Date());

  const isYesterday =
    getDateKey(gameDate) === getDateKey(getYesterday());

  let formattedDate;

  if (isToday) {
    formattedDate = "Today";
  } else if (isYesterday) {
    formattedDate = "Yesterday";
  } else {
    formattedDate = gameDate
      .toLocaleDateString("en-US", {
        timeZone: TIME_ZONE,
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      .replace("Sep ", "Sept ");
  }

  const formattedTime = gameDate.toLocaleTimeString("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });

  const gameStatus = isPregame
    ? formattedTime
    : game.status?.detail;

  const awayQuarterScores =
    game.awayTeam.quarterScores || [];

  const homeQuarterScores =
    game.homeTeam.quarterScores || [];

  const quarterCount = Math.max(
    awayQuarterScores.length,
    homeQuarterScores.length
  );

  const awayTeamStats = game.awayTeam.teamStats || {};
  const homeTeamStats = game.homeTeam.teamStats || {};

  return (
    <main className="cfb-game-page">
      <div className="game-nav">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          ← Back
        </a>

        <Link to="/cfb">← Back to Games</Link>
      </div>

      <section className="game-header">
        <h1>
          {game.awayTeam.name} at {game.homeTeam.name}
        </h1>

        <div className="game-scoreboard">
          <div className="game-team">
            <div className="game-team-info">
              {game.awayTeam.logo && (
                <img
                  src={game.awayTeam.logo}
                  alt={game.awayTeam.name}
                />
              )}

              <div className="game-team-details">
                <strong>
                  {game.awayTeam.rank &&
                    `#${game.awayTeam.rank} `}
                  {game.awayTeam.abbreviation}
                </strong>

                {game.awayTeam.record && (
                  <span>{game.awayTeam.record}</span>
                )}
              </div>
            </div>

            {!isPregame && (
              <strong>{game.awayTeam.score}</strong>
            )}
          </div>

          <div className="game-team">
            <div className="game-team-info">
              {game.homeTeam.logo && (
                <img
                  src={game.homeTeam.logo}
                  alt={game.homeTeam.name}
                />
              )}

              <div className="game-team-details">
                <strong>
                  {game.homeTeam.rank &&
                    `#${game.homeTeam.rank} `}
                  {game.homeTeam.abbreviation}
                </strong>

                {game.homeTeam.record && (
                  <span>{game.homeTeam.record}</span>
                )}
              </div>
            </div>

            {!isPregame && (
              <strong>{game.homeTeam.score}</strong>
            )}
          </div>
        </div>

        <p className="game-status">
          {gameStatus}
          {!isLive && ` · ${formattedDate}`}
        </p>

        {isLive && game.liveGame && (
          <div className="cfb-game-live">
            <strong>
              {game.liveGame.quarter} · {game.liveGame.clock}
            </strong>

            {game.liveGame.down && (
              <span>
                {game.liveGame.down} & {game.liveGame.distance}
              </span>
            )}

            {game.liveGame.play && (
              <p>{game.liveGame.play}</p>
            )}
          </div>
        )}
      </section>

      <div className="game-tabs">
        <button
          onClick={() => setActiveTab("summary")}
          className={activeTab === "summary" ? "active" : ""}
        >
          Summary
        </button>

        <button
          onClick={() => setActiveTab("teamStats")}
          className={activeTab === "teamStats" ? "active" : ""}
        >
          Team Stats
        </button>

        <button
          onClick={() => setActiveTab("playerStats")}
          className={activeTab === "playerStats" ? "active" : ""}
        >
          Player Stats
        </button>

        <button
          onClick={() => setActiveTab("leaders")}
          className={activeTab === "leaders" ? "active" : ""}
        >
          Leaders
        </button>
      </div>

      <section className="game-tab-content">
        {activeTab === "summary" && (
          <div>
            <h2>Scoring</h2>

            {!isPregame && quarterCount > 0 && (
              <div className="cfb-linescore">
                <table>
                  <thead>
                    <tr>
                      <th>Team</th>

                      {Array.from(
                        { length: quarterCount },
                        (_, index) => (
                          <th key={index}>
                            {index < 4
                              ? index + 1
                              : `OT${index - 3}`}
                          </th>
                        )
                      )}

                      <th>T</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>{game.awayTeam.name}</td>

                      {Array.from(
                        { length: quarterCount },
                        (_, index) => (
                          <td key={index}>
                            {awayQuarterScores[index]?.score ?? "-"}
                          </td>
                        )
                      )}

                      <td>{game.awayTeam.score}</td>
                    </tr>

                    <tr>
                      <td>{game.homeTeam.name}</td>

                      {Array.from(
                        { length: quarterCount },
                        (_, index) => (
                          <td key={index}>
                            {homeQuarterScores[index]?.score ?? "-"}
                          </td>
                        )
                      )}

                      <td>{game.homeTeam.score}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "teamStats" && (
          <div>
            <div className="cfb-team-stats">
              <div className="cfb-team-stats-header">
                <div className="cfb-team-stats-team">
                  {game.awayTeam.logo && (
                    <img
                      src={game.awayTeam.logo}
                      alt={game.awayTeam.name}
                    />
                  )}
                  <strong>{game.awayTeam.abbreviation}</strong>
                </div>

                <div className="cfb-team-stats-team">
                  {game.homeTeam.logo && (
                    <img
                      src={game.homeTeam.logo}
                      alt={game.homeTeam.name}
                    />
                  )}
                  <strong>{game.homeTeam.abbreviation}</strong>
                </div>
              </div>

              {TEAM_STATS.map(([key, label]) => (
                <div className="cfb-team-stat-row" key={key}>
                  <strong>{awayTeamStats[key] ?? "-"}</strong>
                  <span>{label}</span>
                  <strong>{homeTeamStats[key] ?? "-"}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "playerStats" && (
          <div>
            <h2>Player Stats</h2>
          </div>
        )}

        {activeTab === "leaders" && (
          <div>
            <h2>Leaders</h2>
          </div>
        )}
      </section>
    </main>
  );
}