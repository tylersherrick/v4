const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football";

function formatCategories(data) {
  return (
    data.splits?.categories?.map((category) => ({
      name: category.name || null,
      displayName:
        category.displayName ||
        category.name ||
        null,
      stats:
        category.stats?.map((stat) => ({
          name: stat.name || null,
          displayName:
            stat.displayName ||
            stat.shortDisplayName ||
            stat.name ||
            null,
          value:
            stat.displayValue ??
            stat.value ??
            null,
        })) || [],
    })) || []
  );
}

async function getJson(url) {
  const response = await fetch(
    url.replace("http://", "https://")
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function getSeasonNumber(seasonRef) {
  const match = seasonRef?.match(
    /\/seasons\/(\d{4})/
  );

  return match ? Number(match[1]) : null;
}

function getRegularSeasonStatsRef(entry) {
  return entry.statistics?.find(
    (item) =>
      item.type === "total" &&
      item.statistics?.$ref?.includes("/types/3/")
  )?.statistics?.$ref;
}

function getNumber(value) {
  const number = Number(
    String(value ?? "").replace(/,/g, "")
  );

  return Number.isNaN(number) ? 0 : number;
}

function getStat(category, name) {
  return category?.stats?.find(
    (stat) => stat.name === name
  );
}

function getCareerTotal(seasons, categoryName, statName) {
  return seasons.reduce((total, season) => {
    const category = season.categories.find(
      (item) => item.name === categoryName
    );

    const stat = getStat(category, statName);

    return total + getNumber(stat?.value);
  }, 0);
}

function formatNumber(value) {
  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }

  return value.toFixed(1);
}

function createStat(name, displayName, value) {
  return {
    name,
    displayName,
    value: formatNumber(value),
  };
}

function buildCareerCategories(seasons) {
  const gamesPlayed = getCareerTotal(
    seasons,
    "general",
    "gamesPlayed"
  );

  const completions = getCareerTotal(
    seasons,
    "passing",
    "completions"
  );

  const passingAttempts = getCareerTotal(
    seasons,
    "passing",
    "passingAttempts"
  );

  const passingYards = getCareerTotal(
    seasons,
    "passing",
    "passingYards"
  );

  const passingTouchdowns = getCareerTotal(
    seasons,
    "passing",
    "passingTouchdowns"
  );

  const interceptions = getCareerTotal(
    seasons,
    "passing",
    "interceptions"
  );

  const rushingAttempts = getCareerTotal(
    seasons,
    "rushing",
    "rushingAttempts"
  );

  const rushingYards = getCareerTotal(
    seasons,
    "rushing",
    "rushingYards"
  );

  const rushingTouchdowns = getCareerTotal(
    seasons,
    "rushing",
    "rushingTouchdowns"
  );

  const receptions = getCareerTotal(
    seasons,
    "receiving",
    "receptions"
  );

  const receivingTargets = getCareerTotal(
    seasons,
    "receiving",
    "receivingTargets"
  );

  const receivingYards = getCareerTotal(
    seasons,
    "receiving",
    "receivingYards"
  );

  const receivingTouchdowns = getCareerTotal(
    seasons,
    "receiving",
    "receivingTouchdowns"
  );

  const completionPct =
    passingAttempts > 0
      ? (completions / passingAttempts) * 100
      : 0;

  const yardsPerPassAttempt =
    passingAttempts > 0
      ? passingYards / passingAttempts
      : 0;

  const passingYardsPerGame =
    gamesPlayed > 0
      ? passingYards / gamesPlayed
      : 0;

  const yardsPerRushAttempt =
    rushingAttempts > 0
      ? rushingYards / rushingAttempts
      : 0;

  const rushingYardsPerGame =
    gamesPlayed > 0
      ? rushingYards / gamesPlayed
      : 0;

  const yardsPerReception =
    receptions > 0
      ? receivingYards / receptions
      : 0;

  const receivingYardsPerGame =
    gamesPlayed > 0
      ? receivingYards / gamesPlayed
      : 0;

  return [
    {
      name: "general",
      displayName: "General",
      stats: [
        createStat(
          "gamesPlayed",
          "Games Played",
          gamesPlayed
        ),
      ],
    },
    {
      name: "passing",
      displayName: "Passing",
      stats: [
        createStat(
          "completions",
          "Completions",
          completions
        ),
        createStat(
          "passingAttempts",
          "Passing Attempts",
          passingAttempts
        ),
        createStat(
          "completionPct",
          "Completion Percentage",
          completionPct
        ),
        createStat(
          "passingYards",
          "Passing Yards",
          passingYards
        ),
        createStat(
          "passingYardsPerGame",
          "Passing Yards Per Game",
          passingYardsPerGame
        ),
        createStat(
          "yardsPerPassAttempt",
          "Yards Per Pass Attempt",
          yardsPerPassAttempt
        ),
        createStat(
          "passingTouchdowns",
          "Passing Touchdowns",
          passingTouchdowns
        ),
        createStat(
          "interceptions",
          "Interceptions",
          interceptions
        ),
      ],
    },
    {
      name: "rushing",
      displayName: "Rushing",
      stats: [
        createStat(
          "rushingAttempts",
          "Rushing Attempts",
          rushingAttempts
        ),
        createStat(
          "rushingYards",
          "Rushing Yards",
          rushingYards
        ),
        createStat(
          "yardsPerRushAttempt",
          "Yards Per Rush Attempt",
          yardsPerRushAttempt
        ),
        createStat(
          "rushingYardsPerGame",
          "Rushing Yards Per Game",
          rushingYardsPerGame
        ),
        createStat(
          "rushingTouchdowns",
          "Rushing Touchdowns",
          rushingTouchdowns
        ),
      ],
    },
    {
      name: "receiving",
      displayName: "Receiving",
      stats: [
        createStat(
          "receptions",
          "Receptions",
          receptions
        ),
        createStat(
          "receivingTargets",
          "Receiving Targets",
          receivingTargets
        ),
        createStat(
          "receivingYards",
          "Receiving Yards",
          receivingYards
        ),
        createStat(
          "yardsPerReception",
          "Yards Per Reception",
          yardsPerReception
        ),
        createStat(
          "receivingYardsPerGame",
          "Receiving Yards Per Game",
          receivingYardsPerGame
        ),
        createStat(
          "receivingTouchdowns",
          "Receiving Touchdowns",
          receivingTouchdowns
        ),
      ],
    },
  ];
}

export async function getPlayerStats(playerId, season) {
  const currentSeason =
    Number(season) || new Date().getFullYear();

  const statisticsLog = await getJson(
    `${ESPN_URL}/athletes/${playerId}/statisticslog`
  );

  const entries = statisticsLog?.entries || [];

  const seasonRefs = entries
    .map((entry) => {
      const seasonNumber = getSeasonNumber(
        entry.season?.$ref
      );

      const statsRef =
        getRegularSeasonStatsRef(entry);

      if (!seasonNumber || !statsRef) {
        return null;
      }

      return {
        season: seasonNumber,
        statsRef,
      };
    })
    .filter(Boolean);

  const seasonResults = await Promise.all(
    seasonRefs.map(async ({ season, statsRef }) => {
      const data = await getJson(statsRef);

      if (!data) {
        return null;
      }

      return {
        season,
        categories: formatCategories(data),
      };
    })
  );

  const seasons = seasonResults
    .filter(Boolean)
    .sort((a, b) => b.season - a.season);

  const currentSeasonStats = seasons.find(
    (item) => item.season === currentSeason
  );

  return {
    id: playerId,
    season: currentSeason,
    categories:
      currentSeasonStats?.categories || [],
    career: {
      categories: buildCareerCategories(seasons),
    },
    seasons,
  };
}