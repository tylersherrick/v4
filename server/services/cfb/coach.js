const CORE_URL =
  "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football";

const TEAM_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams";

function httpsUrl(url) {
  return url?.replace("http://", "https://") || null;
}

function getStat(record, name) {
  return (
    record?.stats?.find((stat) => stat.name === name)?.value ??
    null
  );
}

async function fetchJson(url) {
  const response = await fetch(httpsUrl(url));

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getCoach(coachId) {
  const response = await fetch(
    `${CORE_URL}/coaches/${coachId}?lang=en&region=us`
  );

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const coach = await response.json();

  const careerRecordRef =
    coach.careerRecords?.find((record) =>
      record.$ref?.includes("/record/0")
    )?.$ref || null;

  const careerRecord = careerRecordRef
    ? await fetchJson(careerRecordRef)
    : null;

  const uniqueSeasonRefs = Array.from(
    new Map(
      (coach.coachSeasons || []).map((seasonRef) => {
        const season =
          seasonRef.$ref?.match(/\/seasons\/(\d+)/)?.[1];

        return [season, seasonRef];
      })
    ).values()
  );

  const seasons = await Promise.all(
    uniqueSeasonRefs.map(async (seasonRef) => {
      const seasonCoach = await fetchJson(seasonRef.$ref);

      if (!seasonCoach) {
        return null;
      }

      const seasonMatch =
        seasonRef.$ref?.match(/\/seasons\/(\d+)/);

      const season = seasonMatch
        ? Number(seasonMatch[1])
        : null;

      const teamRef = seasonCoach.team?.$ref || null;
      const teamMatch = teamRef?.match(/\/teams\/(\d+)/);
      const teamId = teamMatch?.[1] || null;

      const recordRef =
        seasonCoach.records?.[0]?.record?.$ref || null;

      const [teamData, record] = await Promise.all([
        teamId
          ? fetchJson(`${TEAM_URL}/${teamId}`)
          : null,
        recordRef
          ? fetchJson(recordRef)
          : null,
      ]);

      const team = teamData?.team;

      return {
        season,
        team: {
          id: teamId,
          name: team?.displayName || null,
          abbreviation: team?.abbreviation || null,
          logo:
            team?.logos?.[0]?.href ||
            team?.logo ||
            null,
        },
        record: record
          ? {
              summary: record.summary || null,
              wins: getStat(record, "wins"),
              losses: getStat(record, "losses"),
              ties: getStat(record, "ties"),
            }
          : null,
      };
    })
  );

  const sortedSeasons = seasons
    .filter(Boolean)
    .sort((a, b) => b.season - a.season);

  return {
    id: coach.id || coachId,
    name:
      coach.firstName && coach.lastName
        ? `${coach.firstName} ${coach.lastName}`
        : null,
    firstName: coach.firstName || null,
    lastName: coach.lastName || null,
    dateOfBirth: coach.dateOfBirth || null,
    birthPlace: {
      city: coach.birthPlace?.city || null,
      state: coach.birthPlace?.state || null,
      country: coach.birthPlace?.country || null,
    },
    careerRecord: careerRecord
      ? {
          summary: careerRecord.summary || null,
          wins: getStat(careerRecord, "wins"),
          losses: getStat(careerRecord, "losses"),
          ties: getStat(careerRecord, "ties"),
          winPercentage: careerRecord.value ?? null,
        }
      : null,
    seasons: sortedSeasons,
  };
}