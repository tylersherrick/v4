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

function normalizeSeasonStats(data, categoryNames) {
  const category = data.categories?.find(
    (item) => categoryNames.includes(item.name)
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

function getOverviewCareerTotals(data, type) {
  const displayName =
    data.statistics?.displayName?.toLowerCase() || "";

  if (!displayName.includes(type)) {
    return {};
  }

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

async function fetchOptionalStats(url) {
  const response = await fetch(url);

  if (response.status === 404) {
    return {
      categories: [],
      teams: {},
    };
  }

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function getPlayerStats(playerId) {
  const statsUrl =
    `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/` +
    `${playerId}/stats`;

  const overviewUrl =
    `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/` +
    `${playerId}/overview`;

  const [
    battingData,
    pitchingData,
    fieldingData,
    overviewResponse,
  ] = await Promise.all([
    fetchOptionalStats(
      `${statsUrl}?category=batting`
    ),
    fetchOptionalStats(
      `${statsUrl}?category=pitching`
    ),
    fetchOptionalStats(
      `${statsUrl}?category=fielding`
    ),
    fetch(overviewUrl),
  ]);

  if (!overviewResponse.ok) {
    throw new Error(
      `ESPN overview request failed: ${overviewResponse.status}`
    );
  }

  const overviewData =
    await overviewResponse.json();

  const battingSeasons = normalizeSeasonStats(
    battingData,
    ["career-batting", "batting"]
  );

  const pitchingSeasons = normalizeSeasonStats(
    pitchingData,
    ["career-pitching", "pitching"]
  );

  const fieldingSeasons = normalizeSeasonStats(
    fieldingData,
    ["fielding"]
  );

  const currentYear = new Date().getFullYear();

  return {
    playerId: String(playerId),

    batting: {
      currentSeason: battingSeasons.filter(
        (season) => season.year === currentYear
      ),
      careerTotals:
        getOverviewCareerTotals(
          overviewData,
          "batting"
        ),
      career: battingSeasons,
    },

    pitching: {
      currentSeason: pitchingSeasons.filter(
        (season) => season.year === currentYear
      ),
      careerTotals:
        getOverviewCareerTotals(
          overviewData,
          "pitching"
        ),
      career: pitchingSeasons,
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