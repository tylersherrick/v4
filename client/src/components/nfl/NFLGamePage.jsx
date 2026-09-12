import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

const TIME_ZONE = "America/Chicago";

const PLAYER_STAT_TABS = [
  ["passing", "Passing"],
  ["rushing", "Rushing"],
  ["receiving", "Receiving"],
  ["defense", "Defense"],
  ["specialTeams", "Special Teams"],
];

const PLAYER_STAT_CATEGORIES = {
  passing: ["passing"],
  rushing: ["rushing"],
  receiving: ["receiving"],
  defense: ["defensive", "interceptions", "fumbles"],
  specialTeams: [
    "kickReturns",
    "puntReturns",
    "kicking",
    "punting",
  ],
};

const PREGAME_LEADER_CATEGORIES = [
  ["passingYards", "Passing Yards"],
  ["rushingYards", "Rushing Yards"],
  ["receivingYards", "Receiving Yards"],
  ["sacks", "Sacks"],
  ["totalTackles", "Total Tackles"],
];

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

function getPregamePlayerCategories(playerStats, categoryNames) {
  const categories = {};

  for (const player of playerStats?.players || []) {
    for (const category of player.categories || []) {
      if (!categoryNames.includes(category.name)) {
        continue;
      }

      if (!categories[category.name]) {
        categories[category.name] = {
          name: category.name,
          displayName: category.displayName || category.name,
          players: [],
        };
      }

      categories[category.name].players.push({
        id: player.id,
        name: player.name,
        headshot: player.headshot,
        position: player.position,
        stats: category.stats || {},
      });
    }
  }

  return Object.values(categories);
}

function getGamePlayerCategories(playerStats, categoryNames) {
  return (playerStats || []).filter((category) =>
    categoryNames.includes(category.name)
  );
}

function PlayerStatsTable({ category }) {
  const players = category.players || [];

  if (!players.length) {
    return null;
  }

  const labels = Array.from(
    new Set(
      players.flatMap((player) =>
        Object.keys(player.stats || {})
      )
    )
  );

  return (
    <div className="cfb-player-stat-category">
      <h3>{category.displayName}</h3>

      <div className="cfb-player-stats-table-wrap">
        <table className="cfb-player-stats-table">
          <thead>
            <tr>
              <th>Player</th>

              {labels.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {players.map((player) => (
              <tr key={`${category.name}-${player.id}`}>
                <td>
                  <Link to={`/nfl/player/${player.id}`}>
                    {player.name
                      .split(" ")
                      .map((name, index, names) =>
                        index === names.length - 1
                          ? name
                          : `${name[0]}.`
                      )
                      .join(" ")}
                  </Link>
                </td>

                {labels.map((label) => (
                  <td key={label}>
                    {player.stats?.[label] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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

const PREGAME_TEAM_STATS = [
  ["record", "Record"],
  ["pointsPerGame", "Points / Game"],
  ["totalYardsPerGame", "Total Yards / Game"],
  ["passingYardsPerGame", "Passing Yards / Game"],
  ["rushingYardsPerGame", "Rushing Yards / Game"],
  ["thirdDownPct", "3rd Down %"],
  ["turnoverDifferential", "Turnover Differential"],
  ["sacksPerGame", "Sacks / Game"],
];

export default function NFLGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [playerStatTab, setPlayerStatTab] = useState("passing");
  const [playerStatsTeam, setPlayerStatsTeam] = useState("away");
  const [pregameLeaders, setPregameLeaders] = useState({
    away: null,
    home: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(
          `${API_URL}/api/nfl/game/${gameId}`
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

  useEffect(() => {
    if (
      game?.status?.state !== "pre" ||
      !game.awayTeam?.id ||
      !game.homeTeam?.id
    ) {
      return;
    }

    async function loadPregameLeaders() {
      try {
        const [awayResponse, homeResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/nfl/team-leaders/${game.awayTeam.id}`
            ),
            fetch(
              `${API_URL}/api/nfl/team-leaders/${game.homeTeam.id}`
            ),
          ]);

        if (!awayResponse.ok || !homeResponse.ok) {
          throw new Error("Unable to load pregame leaders");
        }

        const [away, home] = await Promise.all([
          awayResponse.json(),
          homeResponse.json(),
        ]);

        setPregameLeaders({
          away,
          home,
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadPregameLeaders();
  }, [
    game?.status?.state,
    game?.awayTeam?.id,
    game?.homeTeam?.id,
  ]);

  if (loading) {
    return <p>Loading NFL game...</p>;
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

  const teamStats = isPregame
    ? PREGAME_TEAM_STATS
    : TEAM_STATS;

  const selectedPlayerTeam =
    playerStatsTeam === "away"
      ? game.awayTeam
      : game.homeTeam;

  const selectedPregameLeaders =
    pregameLeaders[playerStatsTeam];

  const selectedPlayerCategories =
    PLAYER_STAT_CATEGORIES[playerStatTab];

  const playerCategories = isPregame
    ? getPregamePlayerCategories(
        selectedPlayerTeam.playerStats,
        selectedPlayerCategories
      )
    : getGamePlayerCategories(
        selectedPlayerTeam.playerStats,
        selectedPlayerCategories
      );

  function getTeamStat(team, stats, key) {
    if (key === "record") {
      return team.record ?? "-";
    }

    const value = stats[key];

    if (value == null) {
      return "-";
    }

    if (key === "thirdDownPct") {
      return `${value}%`;
    }

    return value;
  }

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

        {isPregame && (
          <Link to={`/prediction/${gameId}`}>
            Game Prediction
          </Link>
        )}

        <Link to="/nfl">← Back to Games</Link>
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

            {game.liveGame.text && (
              <p>{game.liveGame.text}</p>
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

              {teamStats.map(([key, label]) => (
                <div className="cfb-team-stat-row" key={key}>
                  <strong>
                    {getTeamStat(
                      game.awayTeam,
                      awayTeamStats,
                      key
                    )}
                  </strong>

                  <span>{label}</span>

                  <strong>
                    {getTeamStat(
                      game.homeTeam,
                      homeTeamStats,
                      key
                    )}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "playerStats" && (
          <div className="cfb-player-stats">
            <div className="cfb-player-stats-teams">
              <button
                className={
                  playerStatsTeam === "away"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPlayerStatsTeam("away")
                }
              >
                {game.awayTeam.abbreviation}
              </button>

              <button
                className={
                  playerStatsTeam === "home"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPlayerStatsTeam("home")
                }
              >
                {game.homeTeam.abbreviation}
              </button>
            </div>

            <div className="cfb-player-stats-tabs">
              {PLAYER_STAT_TABS.map(([key, label]) => (
                <button
                  key={key}
                  className={
                    playerStatTab === key
                      ? "active"
                      : ""
                  }
                  onClick={() => setPlayerStatTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="cfb-player-stats-content">
              {playerCategories.length > 0 ? (
                playerCategories.map((category) => (
                  <PlayerStatsTable
                    key={category.name}
                    category={category}
                  />
                ))
              ) : (
                <p>No player stats available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "leaders" && (
          <div className="cfb-leaders">
            <div className="cfb-player-stats-teams">
              <button
                className={
                  playerStatsTeam === "away" ? "active" : ""
                }
                onClick={() => setPlayerStatsTeam("away")}
              >
                {game.awayTeam.abbreviation}
              </button>

              <button
                className={
                  playerStatsTeam === "home" ? "active" : ""
                }
                onClick={() => setPlayerStatsTeam("home")}
              >
                {game.homeTeam.abbreviation}
              </button>
            </div>

            <div className="cfb-leaders-team">
              <div className="cfb-leaders-team-header">
                {selectedPlayerTeam.logo && (
                  <img
                    src={selectedPlayerTeam.logo}
                    alt={selectedPlayerTeam.name}
                  />
                )}
                <h2>{selectedPlayerTeam.name}</h2>
              </div>

              {isPregame ? (
                selectedPregameLeaders ? (
                  PREGAME_LEADER_CATEGORIES.map(
                    ([key, label]) => {
                      const leader =
                        selectedPregameLeaders[key];

                      if (!leader?.name) {
                        return null;
                      }

                      return (
                        <div
                          className="cfb-leader-category"
                          key={key}
                        >
                          <h3>{label}</h3>

                          <div className="cfb-leader">
                            {leader.headshot && (
                              <img
                                src={leader.headshot}
                                alt={leader.name}
                              />
                            )}

                            <div>
                              {leader.id ? (
                                <Link
                                  to={`/nfl/player/${leader.id}`}
                                >
                                  {leader.name}
                                </Link>
                              ) : (
                                <span>{leader.name}</span>
                              )}

                              <strong>
                                {leader.total ?? "-"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <p>Loading leaders...</p>
                )
              ) : selectedPlayerTeam.leaders?.length > 0 ? (
                selectedPlayerTeam.leaders
                  .filter(
                    (category) =>
                      category.leaders?.length > 0
                  )
                  .map((category) => (
                    <div
                      className="cfb-leader-category"
                      key={category.name}
                    >
                      <h3>{category.displayName}</h3>

                      {category.leaders.map((leader) => (
                        <div
                          className="cfb-leader"
                          key={`${category.name}-${leader.id}`}
                        >
                          {leader.headshot && (
                            <img
                              src={leader.headshot}
                              alt={leader.name}
                            />
                          )}

                          <div>
                            <Link
                              to={`/nfl/player/${leader.id}`}
                            >
                              {leader.name}
                            </Link>
                            <strong>
                              {leader.value ?? "-"}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
              ) : (
                <p>No leaders available.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}