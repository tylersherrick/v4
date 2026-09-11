const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

export async function getGames(season, week, seasonType) {
  const params = new URLSearchParams();

  if (season) params.set("dates", season);
  if (week) params.set("week", week);
  if (seasonType) params.set("seasontype", seasonType);

  const url = `${ESPN_URL}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const games = data.events.map((event) => {
    const competition = event.competitions?.[0];

    const awayTeam = competition?.competitors?.find(
      (team) => team.homeAway === "away"
    );

    const homeTeam = competition?.competitors?.find(
      (team) => team.homeAway === "home"
    );

    return {
      id: event.id,
      name: event.name,
      date: event.date,
      status: {
        state: event.status?.type?.state,
        detail: event.status?.type?.detail,
        completed: event.status?.type?.completed,
      },
      venue: competition?.venue?.fullName,
      awayTeam: {
        id: awayTeam?.team?.id,
        name: awayTeam?.team?.displayName,
        abbreviation: awayTeam?.team?.abbreviation,
        logo: awayTeam?.team?.logo,
        score: awayTeam?.score,
      },
      homeTeam: {
        id: homeTeam?.team?.id,
        name: homeTeam?.team?.displayName,
        abbreviation: homeTeam?.team?.abbreviation,
        logo: homeTeam?.team?.logo,
        score: homeTeam?.score,
      },
    };
  });

  const statusOrder = {
    in: 0,
    pre: 1,
    post: 2,
  };

  const sortedGames = games.sort((a, b) => {
    const statusDifference =
      (statusOrder[a.status?.state] ?? 1) -
      (statusOrder[b.status?.state] ?? 1);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return new Date(a.date) - new Date(b.date);
  });

  const calendar = data.leagues?.[0]?.calendar || [];

  const weeks = calendar.flatMap((type) =>
    (type.entries || [])
      .filter((entry) => Number(entry.value) >= 1)
      .map((entry) => ({
        number: Number(entry.value),
        seasonType: Number(type.value),
        label: entry.label,
        dateRange: entry.detail,
      }))
  );

  const currentSeasonType = Number(
    data.season?.type ?? seasonType
  );

  const currentWeek = weeks.find(
    (entry) =>
      entry.number === Number(data.week?.number) &&
      entry.seasonType === currentSeasonType
  );

  return {
    season: data.season?.year,
    seasonType: currentSeasonType,
    week: {
      number: data.week?.number,
      seasonType: currentSeasonType,
      label: currentWeek?.label,
      dateRange: currentWeek?.dateRange,
    },
    weeks,
    games: sortedGames,
  };
}