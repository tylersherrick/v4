const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams";

const OFFENSE_POSITIONS = [
  "QB",
  "RB",
  "FB",
  "WR",
  "TE",
  "OL",
  "OT",
  "OG",
  "C",
];

const DEFENSE_POSITIONS = [
  "DL",
  "DE",
  "DT",
  "LB",
  "ILB",
  "OLB",
  "DB",
  "CB",
  "S",
];

const SPECIAL_TEAMS_POSITIONS = [
  "PK",
  "K",
  "P",
  "LS",
];

function formatPlayer(player) {
  return {
    id: player.id,
    name: player.displayName,
    firstName: player.firstName || null,
    lastName: player.lastName || null,
    jersey: player.jersey || null,
    position: player.position?.abbreviation || null,
    positionName:
      player.position?.displayName || null,
    class:
      player.experience?.displayValue || null,
    height: player.displayHeight || null,
    weight: player.displayWeight || null,
    headshot: player.headshot?.href || null,
  };
}

export async function getRoster(teamId) {
  const response = await fetch(`${ESPN_URL}/${teamId}/roster`);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const players =
    data.athletes?.flatMap((group) =>
      (group.items || []).map(formatPlayer)
    ) || [];

  const offense = players.filter((player) =>
    OFFENSE_POSITIONS.includes(player.position)
  );

  const defense = players.filter((player) =>
    DEFENSE_POSITIONS.includes(player.position)
  );

  const specialTeams = players.filter((player) =>
    SPECIAL_TEAMS_POSITIONS.includes(player.position)
  );

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
    offense,
    defense,
    specialTeams,
  };
}