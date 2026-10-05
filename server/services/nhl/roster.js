const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";

const FORWARD_POSITIONS = [
  "C",
  "LW",
  "RW",
  "F",
];

const DEFENSE_POSITIONS = [
  "D",
];

const GOALIE_POSITIONS = [
  "G",
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
    height: player.displayHeight || null,
    weight: player.displayWeight || null,
    headshot: player.headshot?.href || null,
  };
}

function sortPlayers(players, positionOrder) {
  return [...players].sort((a, b) => {
    const aPosition = positionOrder.indexOf(
      a.position
    );
    const bPosition = positionOrder.indexOf(
      b.position
    );

    if (aPosition !== bPosition) {
      return aPosition - bPosition;
    }

    return a.name.localeCompare(b.name);
  });
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

  const forwards = sortPlayers(
    players.filter((player) =>
      FORWARD_POSITIONS.includes(player.position)
    ),
    FORWARD_POSITIONS
  );

  const defense = sortPlayers(
    players.filter((player) =>
      DEFENSE_POSITIONS.includes(player.position)
    ),
    DEFENSE_POSITIONS
  );

  const goalies = sortPlayers(
    players.filter((player) =>
      GOALIE_POSITIONS.includes(player.position)
    ),
    GOALIE_POSITIONS
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
    forwards,
    defense,
    goalies,
  };
}