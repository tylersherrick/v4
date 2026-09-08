const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard";

export async function getGames(season, week) {
  const params = new URLSearchParams();

  if (season) params.set("dates", season);
  if (week) params.set("week", week);

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
        rank: awayTeam?.curatedRank?.current,
      },
      homeTeam: {
        id: homeTeam?.team?.id,
        name: homeTeam?.team?.displayName,
        abbreviation: homeTeam?.team?.abbreviation,
        logo: homeTeam?.team?.logo,
        score: homeTeam?.score,
        rank: homeTeam?.curatedRank?.current,
      },
    };
  });

  const statusOrder = {
    in: 0,
    pre: 1,
    post: 2,
  };

  const rankedGames = games
    .filter(
      (game) =>
        game.awayTeam.rank <= 25 ||
        game.homeTeam.rank <= 25
    )
    .sort((a, b) => {
      const statusDifference =
        (statusOrder[a.status?.state] ?? 1) -
        (statusOrder[b.status?.state] ?? 1);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return new Date(a.date) - new Date(b.date);
    });

  const calendarEntries =
    data.leagues?.[0]?.calendar?.flatMap(
      (seasonType) => seasonType.entries || []
    ) || [];

  const currentWeek = calendarEntries.find(
    (entry) =>
      Number(entry.value) === data.week?.number
  );

  const weeks = calendarEntries
    .filter((entry) => Number(entry.value) >= 1)
    .map((entry) => ({
      number: Number(entry.value),
      label: entry.label,
      dateRange: entry.detail,
    }));

  return {
    season: data.season?.year,
    week: {
      number: data.week?.number,
      label: currentWeek?.label,
      dateRange: currentWeek?.detail,
    },
    weeks,
    games: rankedGames,
  };
}