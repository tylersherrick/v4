
const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl";

const STAT_NAMES = {
  shots: ["SOG"],
  goals: ["G"],
  assists: ["A"],
  points: ["PTS"],
  blocked_shots: ["BS"],
  saves: ["SV", "SAVES"],
  goals_allowed: ["GA"],
  time_on_ice: ["TOI"],
};

function normalize(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function findStatIndex(labels, market) {
  const names = STAT_NAMES[market] || [];

  return labels.findIndex((label) =>
    names.some((name) => normalize(label) === normalize(name))
  );
}

function getAthleteId(player) {
  return String(player.athlete?.id || player.id || "");
}

function parseTimeOnIce(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = /^(\d+):([0-5]\d)$/.exec(value.trim());

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function parseStat(value, market) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (market === "time_on_ice") {
    return parseTimeOnIce(value);
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export function extractPlayerStats(summary) {
  const stats = {};

  for (const team of summary.boxscore?.players || []) {
    for (const group of team.statistics || []) {
      const labels =
        group.labels?.length ? group.labels : group.names || [];

      for (const player of group.athletes || []) {
        const playerId = getAthleteId(player);

        if (!playerId) {
          continue;
        }

        if (!stats[playerId]) {
          stats[playerId] = {};
        }

        for (const market of Object.keys(STAT_NAMES)) {
          const index = findStatIndex(labels, market);

          if (index === -1) {
            continue;
          }

          const value = parseStat(
            player.stats?.[index],
            market
          );

          if (value !== null) {
            stats[playerId][market] = value;
          }
        }
      }
    }
  }

  for (const playerStats of Object.values(stats)) {
    if (
      playerStats.goals !== undefined &&
      playerStats.assists !== undefined
    ) {
      playerStats.points =
        playerStats.goals + playerStats.assists;
    }
  }

  return stats;
}

export async function fetchNhlPlayerStats(gameId) {
  const response = await fetch(
    `${ESPN_URL}/summary?event=${encodeURIComponent(gameId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load NHL player statistics");
  }

  const summary = await response.json();

  return extractPlayerStats(summary);
}

export function getPlayerStat(selection, playerStats) {
  const player = playerStats?.[String(selection.playerId)];

  if (!player) {
    return null;
  }

  const value = player[selection.market];

  return Number.isFinite(value) ? value : null;
}
