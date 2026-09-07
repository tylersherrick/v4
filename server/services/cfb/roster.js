const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams";

export async function getRoster(teamId) {
  const response = await fetch(`${ESPN_URL}/${teamId}/roster`);

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
    players:
      data.athletes?.flatMap((group) =>
        (group.items || []).map((player) => ({
          id: player.id,
          name: player.displayName,
          firstName: player.firstName || null,
          lastName: player.lastName || null,
          jersey: player.jersey || null,
          position: player.position?.abbreviation || null,
          positionName: player.position?.displayName || null,
          class: player.experience?.displayValue || null,
          height: player.displayHeight || null,
          weight: player.displayWeight || null,
          headshot: player.headshot?.href || null,
        }))
      ) || [],
  };
}