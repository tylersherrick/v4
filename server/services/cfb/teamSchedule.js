const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams";

export async function getTeamSchedule(teamId, season) {
  const params = new URLSearchParams();

  if (season) {
    params.set("season", season);
  }

  const url =
    `${ESPN_URL}/${teamId}/schedule` +
    (params.toString() ? `?${params.toString()}` : "");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return {
    team: {
      id: data.team?.id || teamId,
      name: data.team?.displayName || null,
      abbreviation: data.team?.abbreviation || null,
      logo:
        data.team?.logo ||
        data.team?.logos?.[0]?.href ||
        null,
    },
    season: data.season?.year || Number(season) || null,
    games:
      data.events?.map((event) => {
        const competition = event.competitions?.[0];

        const awayTeam = competition?.competitors?.find(
          (team) => team.homeAway === "away"
        );

        const homeTeam = competition?.competitors?.find(
          (team) => team.homeAway === "home"
        );

        return {
          id: event.id,
          date: event.date,
          name: event.name,
          status: {
            state: competition?.status?.type?.state,
            detail: competition?.status?.type?.detail,
            completed:
              competition?.status?.type?.completed,
          },
          venue: competition?.venue?.fullName || null,
          awayTeam: {
            id: awayTeam?.team?.id,
            name: awayTeam?.team?.displayName,
            abbreviation: awayTeam?.team?.abbreviation,
            logo: awayTeam?.team?.logo,
            score: awayTeam?.score,
            rank:
              awayTeam?.curatedRank?.current <= 25
                ? awayTeam.curatedRank.current
                : null,
          },
          homeTeam: {
            id: homeTeam?.team?.id,
            name: homeTeam?.team?.displayName,
            abbreviation: homeTeam?.team?.abbreviation,
            logo: homeTeam?.team?.logo,
            score: homeTeam?.score,
            rank:
              homeTeam?.curatedRank?.current <= 25
                ? homeTeam.curatedRank.current
                : null,
          },
        };
      }) || [],
  };
}