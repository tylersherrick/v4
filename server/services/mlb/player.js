function getStatsObject(labels, stats) {
  if (!labels?.length || !stats?.length) {
    return {};
  }

  return Object.fromEntries(
    labels.map((label, index) => [
      label,
      stats[index] ?? null,
    ])
  );
}

export async function getPlayerById(playerId) {
  const url =
    `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/` +
    `${playerId}/overview`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const labels = data.statistics?.labels || [];
  const splits = data.statistics?.splits || [];

  const regularSeason = splits.find(
    (split) => split.displayName === "Regular Season"
  );

  const projected = splits.find(
    (split) => split.displayName === "Projected"
  );

  const career = splits.find(
    (split) => split.displayName === "Career"
  );

  return {
    id: String(playerId),

    stats: {
      seasonName:
        data.statistics?.displayName || null,

      regularSeason: getStatsObject(
        labels,
        regularSeason?.stats
      ),

      projected: getStatsObject(
        labels,
        projected?.stats
      ),

      career: getStatsObject(
        labels,
        career?.stats
      ),
    },

    news:
      data.news?.map((article) => ({
        id: article.id,
        headline: article.headline || null,
        description: article.description || null,
        published:
          article.published ||
          article.lastModified ||
          null,
        image:
          article.images?.[0]?.url || null,
        link:
          article.links?.web?.href || null,
      })) || [],

    videos:
      data.videos?.map((video) => ({
        id: video.id,
        headline: video.headline || null,
        description: video.description || null,
        duration: video.duration || null,
        thumbnail: video.thumbnail || null,
      })) || [],
  };
}