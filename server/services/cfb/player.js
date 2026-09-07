const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/athletes";

export async function getPlayer(playerId) {
  const response = await fetch(`${ESPN_URL}/${playerId}`);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();
  const athlete = data.athlete || data;

  return {
    id: athlete.id || playerId,
    name: athlete.displayName || athlete.fullName || null,
    firstName: athlete.firstName || null,
    lastName: athlete.lastName || null,
    jersey: athlete.jersey || null,
    position: athlete.position?.abbreviation || null,
    positionName: athlete.position?.displayName || null,
    class: athlete.experience?.displayValue || null,
    height: athlete.displayHeight || null,
    weight: athlete.displayWeight || null,
    headshot: athlete.headshot?.href || null,
    team: athlete.team
      ? {
          id: athlete.team.id || null,
          name: athlete.team.displayName || null,
          abbreviation: athlete.team.abbreviation || null,
          logo:
            athlete.team.logo ||
            athlete.team.logos?.[0]?.href ||
            null,
        }
      : null,
  };
}