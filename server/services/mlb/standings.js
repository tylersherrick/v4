const divisions = {
  "AL East": ["30", "10", "2", "1", "14"],
  "AL Central": ["4", "6", "9", "5", "7"],
  "AL West": ["18", "13", "12", "11", "3"],
  "NL East": ["15", "22", "28", "20", "21"],
  "NL Central": ["8", "16", "24", "23", "17"],
  "NL West": ["19", "25", "29", "26", "27"],
};

function getDivision(teamId) {
  return (
    Object.entries(divisions).find(([, teamIds]) =>
      teamIds.includes(String(teamId))
    )?.[0] || null
  );
}

function getStat(stats, name) {
  return stats?.find(
    (stat) => stat.name === name
  )?.displayValue ?? null;
}

function collectTeams(node, league = null, teams = []) {
  if (!node) {
    return teams;
  }

  const nodeName =
    node.abbreviation ||
    node.shortName ||
    node.name ||
    null;

  let currentLeague = league;

  if (nodeName === "AL" || nodeName === "NL") {
    currentLeague = nodeName;
  }

  if (node.standings?.entries?.length) {
    node.standings.entries.forEach((entry, index) => {
      const teamId = String(entry.team?.id || "");

      teams.push({
        id: teamId,
        name: entry.team?.displayName || null,
        abbreviation: entry.team?.abbreviation || null,
        logo: entry.team?.logos?.[0]?.href || null,
        league: currentLeague,
        division: getDivision(teamId),
        divisionRank: index + 1,
        wins: getStat(entry.stats, "wins"),
        losses: getStat(entry.stats, "losses"),
        winPercent: getStat(entry.stats, "winPercent"),
        gamesBehind: getStat(entry.stats, "gamesBehind"),
        playoffSeed: getStat(entry.stats, "playoffSeed"),
      });
    });
  }

  node.children?.forEach((child) => {
    collectTeams(
      child,
      currentLeague,
      teams
    );
  });

  return teams;
}

export async function getMLBStandings() {
  const url =
    "https://site.web.api.espn.com/apis/v2/sports/baseball/mlb/standings?level=3";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN standings request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return collectTeams(data);
}