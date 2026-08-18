const espnToMlbTeamId = {
  "1": 110,
  "2": 111,
  "3": 108,
  "4": 145,
  "5": 114,
  "6": 116,
  "7": 118,
  "8": 158,
  "9": 142,
  "10": 147,
  "11": 133,
  "12": 136,
  "13": 140,
  "14": 141,
  "15": 144,
  "16": 112,
  "17": 113,
  "18": 117,
  "19": 119,
  "20": 120,
  "21": 121,
  "22": 143,
  "23": 134,
  "24": 138,
  "25": 135,
  "26": 137,
  "27": 115,
  "28": 146,
  "29": 109,
  "30": 139,
};

function normalizeName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function getEspnPlayerId(name) {
  const url =
    `https://site.web.api.espn.com/apis/search/v2?` +
    `query=${encodeURIComponent(name)}` +
    `&limit=10`;

  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  const playerResults = data.results?.find(
    (result) => result.type === "player"
  );

  const normalizedTarget = normalizeName(name);

  const player = playerResults?.contents?.find(
    (item) =>
      item.sport === "baseball" &&
      item.defaultLeagueSlug === "mlb" &&
      normalizeName(item.displayName) === normalizedTarget
  );

  if (!player?.uid) {
    return null;
  }

  return player.uid.split("~a:")[1] || null;
}

async function getLeader({
  mlbTeamId,
  category,
  statGroup,
}) {
  const currentYear = new Date().getFullYear();

  const url =
    `https://statsapi.mlb.com/api/v1/stats/leaders` +
    `?leaderCategories=${category}` +
    `&season=${currentYear}` +
    `&sportId=1` +
    `&teamId=${mlbTeamId}` +
    `&statGroup=${statGroup}` +
    `&gameType=R` +
    `&limit=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `MLB leader request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const leader =
    data.leagueLeaders?.[0]?.leaders?.[0];

  if (!leader) {
    return null;
  }

  const name = leader.person?.fullName || null;

  return {
    mlbPlayerId: leader.person?.id || null,
    espnPlayerId: name
      ? await getEspnPlayerId(name)
      : null,
    name,
    value: leader.value || null,
  };
}

export async function getTeamLeaders(teamId) {
  const mlbTeamId =
    espnToMlbTeamId[String(teamId)];

  if (!mlbTeamId) {
    throw new Error("MLB team ID mapping not found");
  }

  const [
    average,
    homeRuns,
    rbi,
    wins,
    era,
    strikeouts,
  ] = await Promise.all([
    getLeader({
      mlbTeamId,
      category: "battingAverage",
      statGroup: "hitting",
    }),
    getLeader({
      mlbTeamId,
      category: "homeRuns",
      statGroup: "hitting",
    }),
    getLeader({
      mlbTeamId,
      category: "runsBattedIn",
      statGroup: "hitting",
    }),
    getLeader({
      mlbTeamId,
      category: "wins",
      statGroup: "pitching",
    }),
    getLeader({
      mlbTeamId,
      category: "earnedRunAverage",
      statGroup: "pitching",
    }),
    getLeader({
      mlbTeamId,
      category: "strikeouts",
      statGroup: "pitching",
    }),
  ]);

  return {
    batting: {
      average,
      homeRuns,
      rbi,
    },
    pitching: {
      wins,
      era,
      strikeouts,
    },
  };
}