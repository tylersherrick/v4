function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export async function getTodayGames(selectedDate) {
  const date = selectedDate || getTodayDate();

  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard` +
    `?dates=${date}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.events.map((event) => {
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
}