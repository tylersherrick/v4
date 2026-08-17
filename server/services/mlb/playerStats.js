function getTeam(data, teamId, teamSlug) {
  return (
    data.teams?.[teamId] ||
    data.teams?.[teamSlug] ||
    null
  );
}

function getStatsObject(labels, stats) {
  return Object.fromEntries(
    (labels || []).map((label, index) => [
      label,
      stats?.[index] ?? null,
    ])
  );
}

function normalizeSeasonStats(data, categoryName) {
  const category = data.categories?.find(
    (item) => item.name === categoryName
  );

  if (!category) {
    return [];
  }

  return (
    category.statistics?.map((season) => {
      const team = getTeam(
        data,
        season.teamId,
        season.teamSlug
      );

      return {
        year: season.season?.year ?? null,

        team: {
          id: season.teamId || null,
          name: team?.displayName || null,
          abbreviation: team?.abbreviation || null,
          logo:
            team?.logos?.find((logo) =>
              logo.rel?.includes("default")
            )?.href || null,
        },

        position: season.position || null,

        stats: getStatsObject(
          category.labels,
          season.stats
        ),
      };
    }) || []
  );
}

function normalizeCareerPositions(data) {
  const category = data.categories?.find(
    (item) => item.name === "career-position"
  );

  if (!category) {
    return [];
  }

  return (
    category.statistics?.map((position) => ({
      position:
        position.abbreviation ||
        position.displayName ||
        null,

      stats: getStatsObject(
        category.labels,
        position.stats
      ),
    })) || []
  );
}

function getCareerBattingTotals(data) {
  const labels = data.statistics?.labels || [];

  const career = data.statistics?.splits?.find(
    (split) => split.displayName === "Career"
  );

  if (!career) {
    return {};
  }

  return getStatsObject(
    labels,
    career.stats
  );
}

export async function getPlayerStats(playerId) {
  const statsUrl =
    `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/` +
    `${playerId}/stats`;

  const overviewUrl =
    `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/` +
    `${playerId}/overview`;

  const [
    battingResponse,
    fieldingResponse,
    overviewResponse,
  ] = await Promise.all([
    fetch(`${statsUrl}?category=batting`),
    fetch(`${statsUrl}?category=fielding`),
    fetch(overviewUrl),
  ]);

  if (!battingResponse.ok) {
    throw new Error(
      `ESPN batting request failed: ${battingResponse.status}`
    );
  }

  if (!fieldingResponse.ok) {
    throw new Error(
      `ESPN fielding request failed: ${fieldingResponse.status}`
    );
  }

  if (!overviewResponse.ok) {
    throw new Error(
      `ESPN overview request failed: ${overviewResponse.status}`
    );
  }

  const [
    battingData,
    fieldingData,
    overviewData,
  ] = await Promise.all([
    battingResponse.json(),
    fieldingResponse.json(),
    overviewResponse.json(),
  ]);

  const battingSeasons =
    normalizeSeasonStats(
      battingData,
      "career-batting"
    );

  const fieldingSeasons =
    normalizeSeasonStats(
      fieldingData,
      "fielding"
    );

  const currentYear = new Date().getFullYear();

  return {
    playerId: String(playerId),

    batting: {
      currentSeason: battingSeasons.filter(
        (season) => season.year === currentYear
      ),

      careerTotals:
        getCareerBattingTotals(overviewData),

      career: battingSeasons,
    },

    fielding: {
      currentSeason: fieldingSeasons.filter(
        (season) => season.year === currentYear
      ),

      career: fieldingSeasons,

      careerByPosition:
        normalizeCareerPositions(fieldingData),
    },
  };
}