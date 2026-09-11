import { getTeamLeaders } from "./teamLeaders.js";
import { getTeamPlayerStats } from "./teamPlayerStats.js";

function getTeamLogo(competitor) {
  return (
    competitor?.team?.logo ||
    competitor?.team?.logos?.[0]?.href ||
    null
  );
}

function getQuarterScores(competitor) {
  return (
    competitor?.linescores?.map((quarter) => ({
      quarter: quarter.period,
      score:
        quarter.displayValue ??
        quarter.value ??
        "0",
    })) || []
  );
}

function getTeamStats(data, teamId) {
  const team = data.boxscore?.teams?.find(
    (teamData) =>
      String(teamData.team?.id) === String(teamId)
  );

  if (!team?.statistics?.length) {
    return {};
  }

  return Object.fromEntries(
    team.statistics.map((stat) => [
      stat.name,
      stat.displayValue ?? stat.value ?? null,
    ])
  );
}

function getSeasonStat(categories, categoryName, statName) {
  const category = categories.find(
    (item) => item.name === categoryName
  );

  const stat = category?.stats?.find(
    (item) => item.name === statName
  );

  return stat?.displayValue ?? stat?.value ?? null;
}

function getGamesPlayed(record) {
  if (!record) {
    return 0;
  }

  return record
    .split("-")
    .map(Number)
    .filter(Number.isFinite)
    .reduce((total, value) => total + value, 0);
}

async function getSeasonTeamStats(teamId, record) {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/" +
    `${teamId}/statistics`;

  const response = await fetch(url);

  if (!response.ok) {
    return {};
  }

  const data = await response.json();
  const categories =
    data.results?.stats?.categories || [];

  const sacks = Number(
    getSeasonStat(
      categories,
      "defensive",
      "sacks"
    )
  );

  const gamesPlayed = getGamesPlayed(record);

  return {
    pointsPerGame: getSeasonStat(
      categories,
      "passing",
      "totalPointsPerGame"
    ),
    totalYardsPerGame: getSeasonStat(
      categories,
      "passing",
      "yardsPerGame"
    ),
    passingYardsPerGame: getSeasonStat(
      categories,
      "passing",
      "passingYardsPerGame"
    ),
    rushingYardsPerGame: getSeasonStat(
      categories,
      "rushing",
      "rushingYardsPerGame"
    ),
    thirdDownPct: getSeasonStat(
      categories,
      "miscellaneous",
      "thirdDownConvPct"
    ),
    turnoverDifferential: getSeasonStat(
      categories,
      "miscellaneous",
      "turnOverDifferential"
    ),
    sacksPerGame:
      gamesPlayed > 0 && Number.isFinite(sacks)
        ? (sacks / gamesPlayed).toFixed(1)
        : null,
  };
}

function getPlayerStats(data, teamId) {
  const team = data.boxscore?.players?.find(
    (teamData) =>
      String(teamData.team?.id) === String(teamId)
  );

  if (!team?.statistics?.length) {
    return [];
  }

  return team.statistics.map((category) => ({
    name: category.name,
    displayName: category.text || category.name,
    labels: category.labels || [],
    players:
      category.athletes?.map((player) => ({
        id: player.athlete?.id,
        name: player.athlete?.displayName,
        headshot:
          player.athlete?.headshot?.href || null,
        jersey:
          player.athlete?.jersey || null,
        starter: player.starter === true,
        stats: Object.fromEntries(
          (category.labels || []).map(
            (label, index) => [
              label,
              player.stats?.[index] ?? null,
            ]
          )
        ),
      })) || [],
  }));
}

function getTeamInjuries(data, teamId) {
  const team = data.injuries?.find(
    (teamData) =>
      String(teamData.team?.id) === String(teamId)
  );

  if (!team?.injuries?.length) {
    return [];
  }

  return team.injuries.map((injury) => ({
    id: injury.athlete?.id,
    name: injury.athlete?.displayName,
    headshot:
      injury.athlete?.headshot?.href || null,
    position:
      injury.athlete?.position?.abbreviation || null,
    status: injury.status || null,
    injury:
      injury.details?.type ||
      injury.type?.description ||
      injury.type ||
      null,
    date: injury.date || null,
  }));
}

function getLeaders(data, teamId) {
  const team = data.leaders?.find(
    (teamData) =>
      String(teamData.team?.id) === String(teamId)
  );

  if (!team?.leaders?.length) {
    return [];
  }

  return team.leaders.map((category) => ({
    name: category.name,
    displayName:
      category.displayName || category.name,
    leaders:
      category.leaders?.map((leader) => ({
        id: leader.athlete?.id,
        name: leader.athlete?.displayName,
        headshot:
          leader.athlete?.headshot?.href || null,
        value:
          leader.displayValue ??
          leader.value ??
          null,
      })) || [],
  }));
}

function getOdds(data) {
  const odds = data.pickcenter?.[0];

  if (!odds) {
    return null;
  }

  return {
    provider: odds.provider?.name || null,
    details: odds.details || null,
    spread: odds.spread ?? null,
    overUnder: odds.overUnder ?? null,
    awayMoneyline:
      odds.awayTeamOdds?.moneyLine ?? null,
    homeMoneyline:
      odds.homeTeamOdds?.moneyLine ?? null,
  };
}

function getLiveGame(data, competition) {
  if (competition.status?.type?.state !== "in") {
    return null;
  }

  const plays = data.plays || [];
  const currentPlay = plays[plays.length - 1];

  if (!currentPlay) {
    return null;
  }

  return {
    quarter:
      competition.status?.period ??
      currentPlay.period?.number ??
      null,
    clock:
      competition.status?.displayClock ||
      currentPlay.clock?.displayValue ||
      null,
    down:
      currentPlay.start?.down ?? null,
    distance:
      currentPlay.start?.distance ?? null,
    yardLine:
      currentPlay.start?.yardLine ?? null,
    possession:
      currentPlay.start?.team?.id || null,
    text: currentPlay.text || null,
  };
}

export async function getGame(gameId) {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary" +
    `?event=${gameId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `ESPN request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const competition =
    data.header?.competitions?.[0];

  if (!competition) {
    throw new Error("Game data not found.");
  }

  const awayCompetitor =
    competition.competitors?.find(
      (team) => team.homeAway === "away"
    );

  const homeCompetitor =
    competition.competitors?.find(
      (team) => team.homeAway === "home"
    );

  const awayId = awayCompetitor?.team?.id;
  const homeId = homeCompetitor?.team?.id;

  const awayRecord =
    awayCompetitor?.record?.find(
      (record) => record.type === "total"
    )?.summary || null;

  const homeRecord =
    homeCompetitor?.record?.find(
      (record) => record.type === "total"
    )?.summary || null;

  const isPregame =
    competition.status?.type?.state === "pre";

  let awayTeamStats;
  let homeTeamStats;
  let awayPlayerStats;
  let homePlayerStats;
  let awayLeaders;
  let homeLeaders;

  if (isPregame) {
    [
      awayTeamStats,
      homeTeamStats,
      awayPlayerStats,
      homePlayerStats,
      awayLeaders,
      homeLeaders,
    ] = await Promise.all([
      getSeasonTeamStats(awayId, awayRecord),
      getSeasonTeamStats(homeId, homeRecord),
      getTeamPlayerStats(awayId),
      getTeamPlayerStats(homeId),
      getTeamLeaders(awayId),
      getTeamLeaders(homeId),
    ]);
  } else {
    awayTeamStats = getTeamStats(data, awayId);
    homeTeamStats = getTeamStats(data, homeId);
    awayPlayerStats = getPlayerStats(data, awayId);
    homePlayerStats = getPlayerStats(data, homeId);
    awayLeaders = getLeaders(data, awayId);
    homeLeaders = getLeaders(data, homeId);
  }

  return {
    id: data.header?.id || gameId,
    date: competition.date,

    status: {
      state: competition.status?.type?.state,
      detail: competition.status?.type?.detail,
      completed:
        competition.status?.type?.completed,
      period: competition.status?.period,
      clock:
        competition.status?.displayClock || null,
    },

    liveGame: getLiveGame(data, competition),

    venue: {
      name:
        competition.venue?.fullName ||
        data.gameInfo?.venue?.fullName ||
        null,
      city:
        competition.venue?.address?.city ||
        data.gameInfo?.venue?.address?.city ||
        null,
      state:
        competition.venue?.address?.state ||
        data.gameInfo?.venue?.address?.state ||
        null,
    },

    odds: getOdds(data),

    awayTeam: {
      id: awayId,
      name: awayCompetitor?.team?.displayName,
      abbreviation:
        awayCompetitor?.team?.abbreviation,
      logo: getTeamLogo(awayCompetitor),
      score: awayCompetitor?.score,
      record: awayRecord,
      quarterScores:
        getQuarterScores(awayCompetitor),
      teamStats: awayTeamStats,
      playerStats: awayPlayerStats,
      leaders: awayLeaders,
      injuries: getTeamInjuries(data, awayId),
    },

    homeTeam: {
      id: homeId,
      name: homeCompetitor?.team?.displayName,
      abbreviation:
        homeCompetitor?.team?.abbreviation,
      logo: getTeamLogo(homeCompetitor),
      score: homeCompetitor?.score,
      record: homeRecord,
      quarterScores:
        getQuarterScores(homeCompetitor),
      teamStats: homeTeamStats,
      playerStats: homePlayerStats,
      leaders: homeLeaders,
      injuries: getTeamInjuries(data, homeId),
    },
  };
}