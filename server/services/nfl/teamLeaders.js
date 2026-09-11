const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl";

const SITE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";

async function getAthlete(athleteRef) {
  if (!athleteRef) {
    return null;
  }

  const response = await fetch(
    athleteRef.replace("http://", "https://")
  );

  if (!response.ok) {
    return null;
  }

  const athlete = await response.json();

  return {
    id: athlete.id || null,
    name: athlete.displayName || athlete.fullName || null,
    headshot: athlete.headshot?.href || null,
  };
}

async function getGamesPlayed(teamId, season) {
  const response = await fetch(
    `${SITE_URL}/${teamId}/schedule?season=${season}`
  );

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();

  return (
    data.events?.filter((event) => {
      const status =
        event.competitions?.[0]?.status?.type;

      return (
        status?.completed === true ||
        status?.state === "in"
      );
    }).length || 0
  );
}

export async function getTeamLeaders(teamId, season) {
  const currentSeason =
    season || new Date().getFullYear();

  const url =
    `${ESPN_URL}/seasons/${currentSeason}/types/2/teams/` +
    `${teamId}/leaders?lang=en&region=us`;

  const [response, gamesPlayed] = await Promise.all([
    fetch(url),
    getGamesPlayed(teamId, currentSeason),
  ]);

  if (!response.ok) {
    return {
      gamesPlayed,
      passingYards: null,
      rushingYards: null,
      receivingYards: null,
      sacks: null,
      totalTackles: null,
    };
  }

  const data = await response.json();

  const categories = data.categories || [];

  const wantedCategories = [
    "passingYards",
    "rushingYards",
    "receivingYards",
    "sacks",
    "totalTackles",
  ];

  const results = await Promise.all(
    wantedCategories.map(async (categoryName) => {
      const category = categories.find(
        (item) => item.name === categoryName
      );

      const leader = category?.leaders?.[0];

      if (!leader) {
        return [categoryName, null];
      }

      const athlete = await getAthlete(
        leader.athlete?.$ref
      );

      const total = Number(
        leader.value ?? leader.displayValue
      );

      return [
        categoryName,
        {
          id: athlete?.id || null,
          name: athlete?.name || null,
          headshot: athlete?.headshot || null,
          total: Number.isNaN(total) ? null : total,
          perGame:
            !Number.isNaN(total) && gamesPlayed > 0
              ? Number((total / gamesPlayed).toFixed(1))
              : null,
        },
      ];
    })
  );

  return {
    gamesPlayed,
    ...Object.fromEntries(results),
  };
}