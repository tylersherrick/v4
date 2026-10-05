const PREGAME_STATS = [
  ["avgGoals", "Goals / Game"],
  ["avgGoalsAgainst", "Goals Against / Game"],
  ["avgShots", "Shots / Game"],
  ["avgShotsAgainst", "Shots Against / Game"],
  ["powerPlayPct", "Power Play %"],
  ["penaltyKillPct", "Penalty Kill %"],
  ["powerPlayGoals", "Power Play Goals"],
  ["penaltyMinutes", "Penalty Minutes"],
];

const GAME_STATS = [
  ["shotsTotal", "Shots"],
  ["hits", "Hits"],
  ["blockedShots", "Blocked Shots"],
  ["faceoffPercent", "Faceoff %"],
  ["powerPlay", "Power Play"],
  ["powerPlayPct", "Power Play %"],
  ["shortHandedGoals", "Shorthanded Goals"],
  ["takeaways", "Takeaways"],
  ["giveaways", "Giveaways"],
  ["penalties", "Penalties"],
  ["penaltyMinutes", "Penalty Minutes"],
];

function findStat(stats, key) {
  return stats.find(
    (item) => item.name === key
  );
}

function getStat(stats, key) {
  const stat = findStat(stats, key);

  if (!stat) {
    return "-";
  }

  if (
    key === "powerPlayPct" ||
    key === "penaltyKillPct" ||
    key === "faceoffPercent"
  ) {
    const value = String(stat.value);

    return value.includes("%")
      ? value
      : `${value}%`;
  }

  return stat.value;
}

function getPowerPlay(stats) {
  const goals = findStat(
    stats,
    "powerPlayGoals"
  );

  const opportunities = findStat(
    stats,
    "powerPlayOpportunities"
  );

  if (!goals || !opportunities) {
    return "-";
  }

  return `${goals.value}/${opportunities.value}`;
}

function getGameStat(stats, key) {
  if (key === "powerPlay") {
    return getPowerPlay(stats);
  }

  return getStat(stats, key);
}

export default function NHLGameTeamStats({ game }) {
  const awayTeamStats =
    game.teamStats?.away?.stats || [];

  const homeTeamStats =
    game.teamStats?.home?.stats || [];

  const isPregame =
    game.status?.state === "pre";

  const statsToShow =
    isPregame
      ? PREGAME_STATS
      : GAME_STATS;

  return (
    <div className="cfb-team-stats">
      <div className="cfb-team-stats-header">
        <div className="cfb-team-stats-team">
          {game.awayTeam.logo && (
            <img
              src={game.awayTeam.logo}
              alt={game.awayTeam.name}
            />
          )}

          <strong>
            {game.awayTeam.abbreviation}
          </strong>
        </div>

        <div className="cfb-team-stats-team">
          {game.homeTeam.logo && (
            <img
              src={game.homeTeam.logo}
              alt={game.homeTeam.name}
            />
          )}

          <strong>
            {game.homeTeam.abbreviation}
          </strong>
        </div>
      </div>

      {isPregame && (
        <div className="cfb-team-stat-row">
          <strong>
            {game.awayTeam.record || "-"}
          </strong>

          <span>Record</span>

          <strong>
            {game.homeTeam.record || "-"}
          </strong>
        </div>
      )}

      {statsToShow.map(([key, label]) => (
        <div
          className="cfb-team-stat-row"
          key={key}
        >
          <strong>
            {isPregame
              ? getStat(awayTeamStats, key)
              : getGameStat(awayTeamStats, key)}
          </strong>

          <span>{label}</span>

          <strong>
            {isPregame
              ? getStat(homeTeamStats, key)
              : getGameStat(homeTeamStats, key)}
          </strong>
        </div>
      ))}
    </div>
  );
}