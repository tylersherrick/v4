const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/athletes";

export async function getPlayer(playerId) {
  const response = await fetch(`${ESPN_URL}/${playerId}`);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const athlete = await response.json();

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
  };
}