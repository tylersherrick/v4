import { Link } from "react-router-dom";

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
                  <Link to={`/cfb/player/${player.id}`}>
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

export default function CFBGamePlayerStats({
  game,
  isPregame,
  playerStatTab,
  setPlayerStatTab,
  playerStatsTeam,
  setPlayerStatsTeam,
}) {
  const selectedPlayerTeam =
    playerStatsTeam === "away"
      ? game.awayTeam
      : game.homeTeam;

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

  return (
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
  );
}