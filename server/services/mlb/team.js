export async function getTeamById(teamId) {
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/` +
    `${teamId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();
  const team = data.team;

  if (!team) {
    throw new Error("Team data not found.");
  }

  const overallRecord = team.record?.items?.find(
    (record) => record.type === "total"
  );

  const homeRecord = team.record?.items?.find(
    (record) => record.type === "home"
  );

  const roadRecord = team.record?.items?.find(
    (record) => record.type === "road"
  );

  const overallStats = Object.fromEntries(
    (overallRecord?.stats || []).map((stat) => [
      stat.name,
      stat.value,
    ])
  );

  return {
    id: team.id,
    slug: team.slug,
    location: team.location,
    name: team.name,
    abbreviation: team.abbreviation,
    displayName: team.displayName,
    shortDisplayName: team.shortDisplayName,

    colors: {
      primary: team.color || null,
      alternate: team.alternateColor || null,
    },

    logo:
      team.logos?.find(
        (logo) =>
          logo.rel?.includes("full") &&
          logo.rel?.includes("default")
      )?.href || null,

    record: {
      overall: overallRecord?.summary || null,
      home: homeRecord?.summary || null,
      road: roadRecord?.summary || null,
      wins: overallStats.wins ?? null,
      losses: overallStats.losses ?? null,
      gamesPlayed: overallStats.gamesPlayed ?? null,
      winPercent: overallStats.winPercent ?? null,
      streak: overallStats.streak ?? null,
    },

    standings: {
      playoffSeed: overallStats.playoffSeed ?? null,
      divisionGamesBehind:
        overallStats.divisionGamesBehind ?? null,
      runDifferential:
        overallStats.pointDifferential ?? null,
      playoffPercent:
        overallStats.playoffPercent ?? null,
      wildCardPercent:
        overallStats.wildCardPercent ?? null,
    },

    venue: {
      id: team.franchise?.venue?.id || null,
      name: team.franchise?.venue?.fullName || null,
      city:
        team.franchise?.venue?.address?.city || null,
      state:
        team.franchise?.venue?.address?.state || null,
      indoor:
        team.franchise?.venue?.indoor ?? null,
      grass:
        team.franchise?.venue?.grass ?? null,
      image:
        team.franchise?.venue?.images?.[0]?.href ||
        null,
    },
  };
}