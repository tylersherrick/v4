const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";

const CORE_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl";

export async function getTeam(teamId) {
  const season = new Date().getFullYear();

  const [teamResponse, coachesResponse] = await Promise.all([
    fetch(`${ESPN_URL}/${teamId}`),
    fetch(
      `${CORE_URL}/seasons/${season}/teams/${teamId}/coaches`
    ),
  ]);

  if (!teamResponse.ok) {
    throw new Error(
      `ESPN request failed: ${teamResponse.status}`
    );
  }

  const data = await teamResponse.json();
  const team = data.team;

  if (!team) {
    throw new Error("Team data not found.");
  }

  let headCoach = null;

  if (coachesResponse.ok) {
    const coachesData = await coachesResponse.json();
    const coachRef = coachesData.items?.[0]?.$ref;

    if (coachRef) {
      const coachResponse = await fetch(
        coachRef.replace("http://", "https://")
      );

      if (coachResponse.ok) {
        const coach = await coachResponse.json();

        headCoach = {
          id: coach.id || null,
          name:
            coach.firstName && coach.lastName
              ? `${coach.firstName} ${coach.lastName}`
              : null,
          firstName: coach.firstName || null,
          lastName: coach.lastName || null,
        };
      }
    }
  }

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
    record: team.record?.items?.find(
      (record) => record.type === "total"
    )?.summary || null,
    standingSummary:
      team.standingSummary || null,
    headCoach,
  };
}