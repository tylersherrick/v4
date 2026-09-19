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

export default function CFBGameTeamStats({
  game,
  isPregame,
}) {
  const awayTeamStats = game.awayTeam.teamStats || {};
  const homeTeamStats = game.homeTeam.teamStats || {};

  const teamStats = isPregame
    ? PREGAME_TEAM_STATS
    : TEAM_STATS;

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
  );
}