const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard";

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export async function getTodayGames(selectedDate) {
  const date = selectedDate || getTodayDate();

  const url = `${ESPN_URL}?dates=${date}`;
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

  return games.sort((a, b) => {
    const statusDifference =
      (statusOrder[a.status?.state] ?? 1) -
      (statusOrder[b.status?.state] ?? 1);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return new Date(a.date) - new Date(b.date);
  });
}