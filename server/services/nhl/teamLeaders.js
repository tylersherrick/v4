const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/hockey/leagues/nhl";

const SITE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";

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

function getCurrentNHLSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return month >= 7 ? year + 1 : year;
}

export async function getTeamLeaders(teamId, season) {
  const currentSeason =
    Number(season) || getCurrentNHLSeason();

  const url =
    `${ESPN_URL}/seasons/${currentSeason}/types/2/teams/` +
    `${teamId}/leaders?lang=en&region=us`;

  const [response, gamesPlayed] = await Promise.all([
    fetch(url),
    getGamesPlayed(teamId, currentSeason),
  ]);

  const emptyLeaders = {
    gamesPlayed,
    goals: null,
    assists: null,
    points: null,
    shots: null,
    penaltyMinutes: null,
  };

  if (!response.ok) {
    return emptyLeaders;
  }

  const data = await response.json();
  const categories = data.categories || [];

  const wantedCategories = [
    "goals",
    "assists",
    "points",
    "shots",
    "penaltyMinutes",
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
              ? Number((total / gamesPlayed).toFixed(2))
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