const scheduleCache = new Map();
const CACHE_TIME = 5 * 60 * 1000;

async function fetchTeamSchedule(teamId) {
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  return response.json();
}

function normalizeGame(game, teamId) {
  const competition = game.competitions?.[0];

  const team = competition?.competitors?.find(
    (competitor) =>
      String(competitor.team.id) === String(teamId)
  );

  const opponent = competition?.competitors?.find(
    (competitor) =>
      String(competitor.team.id) !== String(teamId)
  );

  let result = null;

  if (competition?.status?.type?.completed) {
    if (team?.winner === true) {
      result = "W";
    } else if (team?.winner === false) {
      result = "L";
    } else {
      result = "T";
    }
  }

  return {
    id: game.id,
    date: game.date,
    seasonType: game.season?.type,
    status: {
      state: competition?.status?.type?.state,
      detail: competition?.status?.type?.detail,
      completed: competition?.status?.type?.completed,
    },
    result,
    homeAway: team?.homeAway,
    score: team?.score,
    opponentScore: opponent?.score,
    opponent: {
      id: opponent?.team?.id,
      name: opponent?.team?.displayName,
      abbreviation: opponent?.team?.abbreviation,
      logo: opponent?.team?.logo,
    },
  };
}

export async function getTeamSchedule(teamId) {
  const key = String(teamId);

  const cached = scheduleCache.get(key);

  if (
    cached &&
    Date.now() - cached.createdAt < CACHE_TIME
  ) {
    console.log(`Returning cached schedule for team ${teamId}`);
    return cached.data;
  }

  console.log(`Fetching fresh schedule for team ${teamId}`);

  const data = await fetchTeamSchedule(teamId);

  const schedule = (data.events || [])
    .map((game) => normalizeGame(game, teamId))
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    );

  scheduleCache.set(key, {
    createdAt: Date.now(),
    data: schedule,
  });

  return schedule;
}