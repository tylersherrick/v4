const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football";

export async function getPlayerStats(playerId, season) {
  const currentSeason = season || new Date().getFullYear();

  const url =
    `${ESPN_URL}/seasons/${currentSeason}/types/2/athletes/` +
    `${playerId}/statistics/0`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return {
    id: playerId,
    season: Number(currentSeason),
    categories:
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
      })) || [],
  };
}