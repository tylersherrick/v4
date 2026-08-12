const TEAM_ID = "1";
const YEAR = 2026;
const CHUNK_DAYS = 5;
const BATCH_SIZE = 10;

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

async function fetchChunk(chunk) {
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard` +
    `?dates=${chunk.startDate}-${chunk.endDate}`;

  console.log(`Fetching ${chunk.startDate} - ${chunk.endDate}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed for ${chunk.startDate}-${chunk.endDate}: ${response.status}`
    );
  }

  const data = await response.json();

  return data.events.filter((game) =>
    game.competitions?.[0]?.competitors?.some(
      (competitor) => String(competitor.team.id) === TEAM_ID
    )
  );
}

async function getTeamSchedule() {
  const startTime = performance.now();
  try {
    const chunks = buildDateChunks();
    const allGames = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      console.log(
        `\nRunning batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          chunks.length / BATCH_SIZE
        )}\n`
      );

      const batchResults = await Promise.all(
        batch.map((chunk) => fetchChunk(chunk))
      );

      batchResults.forEach((games) => {
        allGames.push(...games);
      });
    }

    const games = [
      ...new Map(allGames.map((game) => [game.id, game])).values(),
    ];

    games.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const preseason = games.filter(
      (game) => game.season?.type === 1
    );

    const regularSeason = games.filter(
      (game) => game.season?.type === 2
    );

    const postseason = games.filter(
      (game) => game.season?.type === 3
    );

    console.log("\n======================================");
    console.log(`TOTAL TEAM EVENTS: ${games.length}`);
    console.log(`PRESEASON: ${preseason.length}`);
    console.log(`REGULAR SEASON: ${regularSeason.length}`);
    console.log(`POSTSEASON: ${postseason.length}`);
    console.log(`CHUNK DAYS: ${CHUNK_DAYS}`);
    console.log(`BATCH SIZE: ${BATCH_SIZE}`);
    console.log("======================================");
    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n======================================");
    console.log(`TOTAL RUNTIME: ${seconds} seconds`);
    console.log("======================================");

    if (regularSeason.length === 162) {
      console.log("✅ REGULAR SEASON VERIFIED: 162 GAMES");
    } else {
      console.log(
        `⚠️ REGULAR SEASON COUNT IS ${regularSeason.length}, EXPECTED 162`
      );
    }

    console.log("======================================\n");

    games.forEach((game) => {
      const competition = game.competitions[0];

      const team = competition.competitors.find(
        (competitor) => String(competitor.team.id) === TEAM_ID
      );

      const opponent = competition.competitors.find(
        (competitor) => String(competitor.team.id) !== TEAM_ID
      );

      const date = new Date(game.date).toLocaleDateString("en-US");

      const location =
        team.homeAway === "home" ? "vs" : "@";

      const completed = game.status?.type?.completed;

      let result = "";
      let score = "Scheduled";

      if (completed) {
        score = `${team.score} - ${opponent.score}`;

        if (team.winner === true) {
          result = "W";
        } else if (team.winner === false) {
          result = "L";
        } else {
          result = "T";
        }
      }

      const seasonType =
        game.season?.type === 1
          ? "PRE"
          : game.season?.type === 2
            ? "REG"
            : game.season?.type === 3
              ? "POST"
              : "OTHER";

      console.log(
        `${date} | ${seasonType} | ${result} ${location} ${opponent.team.displayName} | ${score} | ${game.id}`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

getTeamSchedule();