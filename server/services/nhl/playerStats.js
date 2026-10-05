const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/hockey/leagues/nhl";

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
      item.statistics?.$ref?.includes("/types/2/")
  )?.statistics?.$ref;
}

function getCurrentNHLSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return month >= 7 ? year + 1 : year;
}

export async function getPlayerStats(playerId, season) {
  const currentSeason =
    Number(season) || getCurrentNHLSeason();

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
    seasons,
  };
}