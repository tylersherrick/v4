const ESPN_URL =
  "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete";

function getCategoryDefinitions(data) {
  return Object.fromEntries(
    (data.categories || []).map((category) => [
      category.name,
      {
        name: category.name,
        displayName:
          category.displayName || category.name,
        labels: category.labels || [],
        names: category.names || [],
      },
    ])
  );
}

function getPlayerCategory(category, definition) {
  if (!category || !definition) {
    return null;
  }

  const stats = Object.fromEntries(
    definition.labels.map((label, index) => [
      label,
      category.totals?.[index] ?? null,
    ])
  );

  const hasStats = Object.values(stats).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "-"
  );

  if (!hasStats) {
    return null;
  }

  return {
    name: definition.name,
    displayName: definition.displayName,
    stats,
  };
}

export async function getTeamPlayerStats(teamId, season) {
  const currentSeason =
    season || new Date().getFullYear();

  const params = new URLSearchParams({
    season: String(currentSeason),
    limit: "500",
  });

  const response = await fetch(
    `${ESPN_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();
  const definitions = getCategoryDefinitions(data);

  const players = (data.athletes || [])
    .filter(
      (item) =>
        String(item.athlete?.teamId) ===
        String(teamId)
    )
    .map((item) => {
      const athlete = item.athlete;

      const categories = (
        item.categories || []
      )
        .map((category) =>
          getPlayerCategory(
            category,
            definitions[category.name]
          )
        )
        .filter(Boolean);

      return {
        id: athlete.id,
        name: athlete.displayName,
        headshot: athlete.headshot?.href || null,
        position:
          athlete.position?.abbreviation || null,
        categories,
      };
    })
    .filter(
      (player) => player.categories.length > 0
    );

  return {
    teamId: String(teamId),
    season: Number(currentSeason),
    players,
  };
}