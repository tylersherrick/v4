import { getGamecast } from "./gamecast.js";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary";

function getTeamLogo(team) {
  return (
    team?.logo ||
    team?.logos?.[0]?.href ||
    null
  );
}

function getRecord(competitor) {
  return (
    competitor?.record?.find(
      (record) => record.type === "total"
    )?.summary ||
    competitor?.records?.find(
      (record) => record.type === "total"
    )?.summary ||
    null
  );
}

function formatTeam(competitor) {
  return {
    id: competitor?.team?.id || competitor?.id || null,
    name:
      competitor?.team?.displayName ||
      competitor?.team?.name ||
      null,
    abbreviation:
      competitor?.team?.abbreviation || null,
    logo: getTeamLogo(competitor?.team),
    score: competitor?.score ?? null,
    record: getRecord(competitor),
    linescores:
      competitor?.linescores?.map((period, index) => ({
        period:
          period.period?.number ??
          period.period ??
          index + 1,
        value:
          period.value ??
          period.displayValue ??
          null,
      })) || [],
  };
}

function formatTeamStats(team) {
  return {
    teamId: team?.team?.id || null,
    stats:
      team?.statistics?.map((stat) => ({
        name: stat.name,
        label:
          stat.label ||
          stat.displayName ||
          stat.name,
        abbreviation: stat.abbreviation || null,
        value:
          stat.displayValue ??
          stat.value ??
          null,
      })) || [],
  };
}

function formatAthlete(athlete) {
  return {
    id: athlete?.id || null,
    name:
      athlete?.displayName ||
      athlete?.fullName ||
      null,
    shortName: athlete?.shortName || null,
    headshot: athlete?.headshot?.href || null,
    jersey: athlete?.jersey || null,
    position:
      athlete?.position?.abbreviation || null,
  };
}

function formatLeaderCategory(category) {
  return {
    name: category?.name || null,
    displayName:
      category?.displayName ||
      category?.name ||
      null,
    leaders:
      category?.leaders?.map((leader) => ({
        value:
          leader.displayValue ??
          leader.value ??
          null,
        athlete: formatAthlete(leader.athlete),
        statistics:
          leader.athlete?.statistics?.map(
            (stat) => ({
              name: stat.name,
              displayName:
                stat.displayName ||
                stat.name,
              abbreviation:
                stat.abbreviation || null,
              value:
                stat.displayValue ??
                stat.value ??
                null,
            })
          ) || [],
      })) || [],
  };
}

function formatLeaders(team) {
  return {
    teamId: team?.team?.id || null,
    team: {
      id: team?.team?.id || null,
      name:
        team?.team?.displayName ||
        team?.team?.name ||
        null,
      abbreviation:
        team?.team?.abbreviation || null,
      logo: getTeamLogo(team?.team),
    },
    categories:
      team?.leaders?.map(formatLeaderCategory) || [],
  };
}

function formatInjury(injury) {
  return {
    status: injury?.status || null,
    date: injury?.date || null,
    athlete: formatAthlete(injury?.athlete),
    type:
      injury?.type?.description ||
      injury?.type?.abbreviation ||
      null,
    details: {
      type: injury?.details?.type || null,
      detail: injury?.details?.detail || null,
      side: injury?.details?.side || null,
      returnDate:
        injury?.details?.returnDate || null,
    },
  };
}

function formatInjuries(team) {
  return {
    teamId: team?.team?.id || null,
    team: {
      id: team?.team?.id || null,
      name:
        team?.team?.displayName ||
        team?.team?.name ||
        null,
      abbreviation:
        team?.team?.abbreviation || null,
      logo: getTeamLogo(team?.team),
    },
    injuries:
      team?.injuries?.map(formatInjury) || [],
  };
}

function formatGoalie(goalie) {
  return {
    id: goalie?.id || null,
    name:
      goalie?.displayName ||
      goalie?.fullName ||
      null,
    shortName: goalie?.shortName || null,
    headshot: goalie?.headshot?.href || null,
    jersey: goalie?.jersey || null,
    position:
      goalie?.position?.abbreviation || "G",
  };
}

function formatGoalies(goalies) {
  if (!goalies) {
    return {
      away: [],
      home: [],
    };
  }

  return {
    away:
      goalies.awayTeam?.athletes?.map(
        formatGoalie
      ) || [],
    home:
      goalies.homeTeam?.athletes?.map(
        formatGoalie
      ) || [],
  };
}

function formatOdds(odds) {
  if (!odds) {
    return null;
  }

  return {
    provider: odds.provider?.name || null,
    details: odds.details || null,
    overUnder: odds.overUnder ?? null,
    spread: odds.spread ?? null,
    overOdds: odds.overOdds ?? null,
    underOdds: odds.underOdds ?? null,
    awayTeam: {
      teamId: odds.awayTeamOdds?.teamId || null,
      favorite:
        odds.awayTeamOdds?.favorite === true,
      moneyLine:
        odds.awayTeamOdds?.moneyLine ?? null,
      spreadOdds:
        odds.awayTeamOdds?.spreadOdds ?? null,
    },
    homeTeam: {
      teamId: odds.homeTeamOdds?.teamId || null,
      favorite:
        odds.homeTeamOdds?.favorite === true,
      moneyLine:
        odds.homeTeamOdds?.moneyLine ?? null,
      spreadOdds:
        odds.homeTeamOdds?.spreadOdds ?? null,
    },
  };
}

function formatBroadcasts(broadcasts) {
  return (
    broadcasts?.map((broadcast) => ({
      type:
        broadcast.type?.shortName || null,
      station:
        broadcast.media?.shortName ||
        broadcast.station ||
        null,
      market:
        broadcast.market?.type || null,
      national:
        broadcast.isNational === true,
    })) || []
  );
}

export async function getGame(gameId) {
  const response = await fetch(
    `${ESPN_URL}?event=${gameId}`
  );

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const competition =
    data.header?.competitions?.[0];

  if (!competition) {
    throw new Error("Game not found");
  }

  const awayCompetitor =
    competition.competitors?.find(
      (team) => team.homeAway === "away"
    );

  const homeCompetitor =
    competition.competitors?.find(
      (team) => team.homeAway === "home"
    );

  const awayTeam = formatTeam(awayCompetitor);
  const homeTeam = formatTeam(homeCompetitor);

  const boxscoreTeams =
    data.boxscore?.teams || [];

  const awayStats = boxscoreTeams.find(
    (team) => team.homeAway === "away"
  );

  const homeStats = boxscoreTeams.find(
    (team) => team.homeAway === "home"
  );

  const leaderTeams = data.leaders || [];

  const awayLeaders = leaderTeams.find(
    (team) =>
      String(team.team?.id) ===
      String(awayTeam.id)
  );

  const homeLeaders = leaderTeams.find(
    (team) =>
      String(team.team?.id) ===
      String(homeTeam.id)
  );

  const injuryTeams = data.injuries || [];

  const awayInjuries = injuryTeams.find(
    (team) =>
      String(team.team?.id) ===
      String(awayTeam.id)
  );

  const homeInjuries = injuryTeams.find(
    (team) =>
      String(team.team?.id) ===
      String(homeTeam.id)
  );

  const venue = data.gameInfo?.venue;

  return {
    id: data.header?.id || gameId,
    date: competition.date,
    season: data.header?.season?.year || null,
    seasonType:
      data.header?.season?.type || null,

    status: {
      state:
        competition.status?.type?.state || null,
      detail:
        competition.status?.type?.detail || null,
      shortDetail:
        competition.status?.type?.shortDetail ||
        null,
      completed:
        competition.status?.type?.completed ===
        true,
      period:
        competition.status?.period ?? null,
      clock:
        competition.status?.displayClock || null,
    },

    venue: {
      id: venue?.id || null,
      name: venue?.fullName || null,
      city: venue?.address?.city || null,
      state: venue?.address?.state || null,
    },

    awayTeam,
    homeTeam,

    teamStats: {
      away: formatTeamStats(awayStats),
      home: formatTeamStats(homeStats),
    },

    leaders: {
      away: formatLeaders(awayLeaders),
      home: formatLeaders(homeLeaders),
    },

    injuries: {
      away: formatInjuries(awayInjuries),
      home: formatInjuries(homeInjuries),
    },

    goalies: formatGoalies(data.goalies),

    broadcasts: formatBroadcasts(
      competition.broadcasts ||
      data.broadcasts
    ),

    odds: formatOdds(data.pickcenter?.[0]),

    gamecast: getGamecast(data),
  };
}