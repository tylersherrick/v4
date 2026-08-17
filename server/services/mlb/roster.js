export async function getTeamRoster(teamId) {
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/` +
    `${teamId}/roster`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const players =
    data.athletes?.flatMap((group) =>
      (group.items || []).map((player) => ({
        id: player.id,
        name: player.displayName,
        shortName: player.shortName || null,
        jersey: player.jersey || null,
        headshot: player.headshot?.href || null,

        position: {
          name: player.position?.displayName || null,
          abbreviation: player.position?.abbreviation || null,
        },

        age: player.age ?? null,
        height: player.displayHeight || null,
        weight: player.displayWeight || null,

        bats: player.bats?.abbreviation || null,
        throws: player.throws?.abbreviation || null,

        experience: player.experience?.years ?? null,

        status: {
          name: player.status?.name || null,
          type: player.status?.type || null,
        },
      }))
    ) || [];

  return {
    teamId: String(teamId),
    players,
  };
}