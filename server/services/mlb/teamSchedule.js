const YEAR = 2026;
const CHUNK_DAYS = 5;
const BATCH_SIZE = 10;

const scheduleCache = new Map();
const CACHE_TIME = 5 * 60 * 1000;

function formatESPNDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function buildDateChunks() {
  const chunks = [];

  let start = new Date(YEAR, 0, 1);
  const endOfYear = new Date(YEAR, 11, 31);

  while (start <= endOfYear) {
    const end = new Date(start);
    end.setDate(end.getDate() + CHUNK_DAYS - 1);

    if (end > endOfYear) {
      end.setTime(endOfYear.getTime());
    }

    chunks.push({
      startDate: formatESPNDate(start),
      endDate: formatESPNDate(end),
    });

    start = new Date(end);
    start.setDate(start.getDate() + 1);
  }

  return chunks;
}

async function fetchChunk(chunk, teamId) {
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard` +
    `?dates=${chunk.startDate}-${chunk.endDate}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.events.filter((game) =>
    game.competitions?.[0]?.competitors?.some(
      (competitor) =>
        String(competitor.team.id) === String(teamId)
    )
  );
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
  const cached = scheduleCache.get(String(teamId));

  if (
    cached &&
    Date.now() - cached.createdAt < CACHE_TIME
  ) {
    console.log(`Returning cached schedule for team ${teamId}`);
    return cached.data;
  }

  console.log(`Fetching fresh schedule for team ${teamId}`);

  const chunks = buildDateChunks();
  const allGames = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map((chunk) =>
        fetchChunk(chunk, teamId)
      )
    );

    results.forEach((games) => {
      allGames.push(...games);
    });
  }

  const games = [
    ...new Map(
      allGames.map((game) => [game.id, game])
    ).values(),
  ];

  games.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const schedule = games.map((game) =>
    normalizeGame(game, teamId)
  );

  scheduleCache.set(String(teamId), {
    createdAt: Date.now(),
    data: schedule,
  });

  return schedule;
}