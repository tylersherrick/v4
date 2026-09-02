const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams";

const CONFERENCES = {
  1: { name: "ACC", abbreviation: "ACC" },
  4: { name: "Big 12", abbreviation: "Big 12" },
  5: { name: "Big Ten", abbreviation: "B1G" },
  8: { name: "SEC", abbreviation: "SEC" },
  9: { name: "Pac-12", abbreviation: "Pac-12" },
  12: { name: "Conference USA", abbreviation: "C-USA" },
  15: { name: "Mid-American", abbreviation: "MAC" },
  17: { name: "Mountain West", abbreviation: "MW" },
  18: { name: "FBS Independents", abbreviation: "IND" },
  37: { name: "Sun Belt", abbreviation: "SBC" },
  151: { name: "AAC", abbreviation: "AAC" },
};

export async function getTeam(teamId) {
  const response = await fetch(`${ESPN_URL}/${teamId}`);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();
  const team = data.team;

  if (!team) {
    throw new Error("Team data not found.");
  }

  const conferenceId = team.groups?.id;
  const conference = CONFERENCES[conferenceId];

  return {
    id: team.id,
    name: team.displayName,
    shortName: team.shortDisplayName,
    abbreviation: team.abbreviation,
    nickname: team.nickname,
    location: team.location,
    color: team.color || null,
    alternateColor: team.alternateColor || null,
    logo:
      team.logos?.[0]?.href ||
      team.logo ||
      null,
    conference: {
      id: conferenceId || null,
      name:
        team.groups?.name ||
        conference?.name ||
        null,
      abbreviation:
        team.groups?.abbreviation ||
        conference?.abbreviation ||
        null,
    },
    record: team.record?.items?.find(
      (record) => record.type === "total"
    )?.summary || null,
    standingSummary:
      team.standingSummary || null,
  };
}