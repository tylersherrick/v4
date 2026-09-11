const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/athletes";

async function getTeam(teamRef) {
  if (!teamRef) {
    return null;
  }

  const response = await fetch(
    teamRef.replace("http://", "https://")
  );

  if (!response.ok) {
    return null;
  }

  const team = await response.json();

  return {
    id: team.id || null,
    name:
      team.displayName ||
      team.name ||
      team.nickname ||
      null,
  };
}

export async function getPlayer(playerId) {
  const response = await fetch(`${ESPN_URL}/${playerId}`);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const athlete = await response.json();
  const team = await getTeam(athlete.team?.$ref);

  return {
    id: athlete.id || playerId,
    name: athlete.displayName || athlete.fullName || null,
    firstName: athlete.firstName || null,
    lastName: athlete.lastName || null,
    teamId: team?.id || null,
    team: team?.name || null,
    jersey: athlete.jersey || null,
    position: athlete.position?.abbreviation || null,
    positionName: athlete.position?.displayName || null,
    class: athlete.experience?.displayValue || null,
    height: athlete.displayHeight || null,
    weight: athlete.displayWeight || null,
    headshot: athlete.headshot?.href || null,
  };
}