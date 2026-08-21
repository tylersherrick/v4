function getDateKey(date, timeZone = "America/Chicago") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}${month}${day}`;
}

function getStatObject(labels, stats) {
  if (!labels?.length || !stats?.length) {
    return {};
  }

  return Object.fromEntries(
    labels.map((label, index) => [
      label,
      stats[index] ?? null,
    ])
  );
}

function getTeamLogo(competitor) {
  return (
    competitor?.team?.logo ||
    competitor?.team?.logos?.[0]?.href ||
    competitor?.team?.logos?.[0]?.url ||
    null
  );
}

function getTeamPitchers(teamData) {
  const pitching = teamData.statistics?.find(
    (stat) => stat.type === "pitching"
  );

  if (!pitching?.athletes?.length) {
    return [];
  }

  return pitching.athletes.map((pitcher) => ({
    id: pitcher.athlete.id,
    name: pitcher.athlete.displayName,
    headshot: pitcher.athlete.headshot?.href || null,
    starter: pitcher.starter === true,
    role: pitcher.starter ? "STARTER" : "RELIEF",
    position: pitcher.position?.abbreviation || "P",
    stats: getStatObject(
      pitching.labels,
      pitcher.stats
    ),
  }));
}

function getTeamBatters(teamData) {
  const batting = teamData.statistics?.find(
    (stat) => stat.type === "batting"
  );

  if (!batting?.athletes?.length) {
    return [];
  }

  return batting.athletes.map((player) => ({
    id: player.athlete.id,
    name: player.athlete.displayName,
    headshot: player.athlete.headshot?.href || null,
    starter: player.starter === true,
    battingOrder: player.batOrder ?? null,
    position: player.position?.abbreviation || null,
    stats: getStatObject(
      batting.labels,
      player.stats
    ),
  }));
}

function getTeamLineup(teamData) {
  const batting = teamData.statistics?.find(
    (stat) => stat.type === "batting"
  );

  if (!batting?.athletes?.length) {
    return [];
  }

  return batting.athletes
    .filter(
      (player) =>
        player.starter === true &&
        player.batOrder != null &&
        player.batOrder > 0
    )
    .sort((a, b) => a.batOrder - b.batOrder)
    .map((player) => ({
      id: player.athlete.id,
      name: player.athlete.displayName,
      headshot: player.athlete.headshot?.href || null,
      battingOrder: player.batOrder,
      position: player.position?.abbreviation || null,
      stats: getStatObject(
        batting.labels,
        player.stats
      ),
    }));
}

function getProbablePitcher(competitor) {
  const probable =
    competitor.probables?.find(
      (player) =>
        player.name === "probableStartingPitcher"
    ) || competitor.probables?.[0];

  if (!probable?.athlete) {
    return null;
  }

  const stats =
    probable.statistics?.splits?.categories || [];

  const getStat = (abbreviation) =>
    stats.find(
      (stat) => stat.abbreviation === abbreviation
    )?.displayValue || null;

  return {
    id: probable.athlete.id,
    name: probable.athlete.displayName,
    position:
      probable.athlete.position?.abbreviation ||
      probable.athlete.position ||
      "SP",
    headshot:
      probable.athlete.headshot?.href || null,
    jersey:
      probable.athlete.jersey || null,
    record:
      getStat("W") && getStat("L")
        ? `${getStat("W")}-${getStat("L")}`
        : null,
    era: getStat("ERA"),
  };
}

function getTeamInjuries(data, teamId) {
  const teamData = data.injuries?.find(
    (team) => String(team.team.id) === String(teamId)
  );

  if (!teamData?.injuries?.length) {
    return [];
  }

  return teamData.injuries.map((injury) => ({
    id: injury.athlete?.id,
    name: injury.athlete?.displayName,
    status: injury.status || null,
    injury:
      injury.details?.type ||
      injury.type?.description ||
      injury.type ||
      null,
    date: injury.date || null,
  }));
}

function getLiveCount(data, competition) {
  if (competition.status?.type?.state !== "in") {
    return null;
  }

  const plays = data.plays || [];

  const currentPlay = [...plays]
    .reverse()
    .find(
      (play) =>
        play.resultCount &&
        play.type?.type !== "start-inning" &&
        play.type?.type !== "end-inning"
    );

  if (!currentPlay) {
    return null;
  }

  return {
    balls: currentPlay.resultCount?.balls ?? 0,
    strikes: currentPlay.resultCount?.strikes ?? 0,
    outs: currentPlay.outs ?? 0,
    inning: currentPlay.period?.number ?? null,
    half: currentPlay.period?.type ?? null,
    play: currentPlay.text || null,
    bases: {
      first: Boolean(currentPlay.onFirst),
      second: Boolean(currentPlay.onSecond),
      third: Boolean(currentPlay.onThird),
    },
  };
}

function getCurrentMatchup(
  data,
  competition,
  awayBoxscore,
  homeBoxscore
) {
  const state = competition.status?.type?.state;

  if (state !== "in" && state !== "post") {
    return null;
  }

  const plays = data.plays || [];

  const currentAtBat = [...plays]
    .reverse()
    .find(
      (play) =>
        play.type?.type === "start-batterpitcher" &&
        play.participants?.some(
          (participant) =>
            participant.type === "pitcher"
        ) &&
        play.participants?.some(
          (participant) =>
            participant.type === "batter"
        )
    );

  if (!currentAtBat) {
    return null;
  }

  const pitcherParticipant =
    currentAtBat.participants.find(
      (participant) =>
        participant.type === "pitcher"
    );

  const batterParticipant =
    currentAtBat.participants.find(
      (participant) =>
        participant.type === "batter"
    );

  const pitcherId = pitcherParticipant?.athlete?.id;
  const batterId = batterParticipant?.athlete?.id;

  if (!pitcherId || !batterId) {
    return null;
  }

  const awayPitchers = getTeamPitchers(
    awayBoxscore || {}
  );

  const homePitchers = getTeamPitchers(
    homeBoxscore || {}
  );

  const awayBatters = getTeamBatters(
    awayBoxscore || {}
  );

  const homeBatters = getTeamBatters(
    homeBoxscore || {}
  );

  const pitcher =
    [...awayPitchers, ...homePitchers].find(
      (player) =>
        String(player.id) === String(pitcherId)
    );

  const batter =
    [...awayBatters, ...homeBatters].find(
      (player) =>
        String(player.id) === String(batterId)
    );

  if (!pitcher || !batter) {
    return null;
  }

  const battingTeamId =
    currentAtBat.team?.id;

  const awayTeam =
    competition.competitors?.find(
      (team) => team.homeAway === "away"
    );

  const homeTeam =
    competition.competitors?.find(
      (team) => team.homeAway === "home"
    );

  const batterTeam =
    String(battingTeamId) ===
    String(awayTeam?.team?.id)
      ? awayTeam
      : homeTeam;

  const pitcherTeam =
    String(battingTeamId) ===
    String(awayTeam?.team?.id)
      ? homeTeam
      : awayTeam;

  return {
    inning: currentAtBat.period?.number ?? null,
    half: currentAtBat.period?.type ?? null,

    pitcher: {
      ...pitcher,
      team: {
        id: pitcherTeam?.team?.id,
        name: pitcherTeam?.team?.displayName,
        abbreviation:
          pitcherTeam?.team?.abbreviation,
        logo: getTeamLogo(pitcherTeam),
      },
    },

    batter: {
      ...batter,
      team: {
        id: batterTeam?.team?.id,
        name: batterTeam?.team?.displayName,
        abbreviation:
          batterTeam?.team?.abbreviation,
        logo: getTeamLogo(batterTeam),
      },
    },
  };
}

function getLinescores(competitor) {
  return {
    innings:
      competitor?.linescores?.map((inning) => ({
        inning: inning.period,
        runs:
          inning.displayValue ??
          inning.value ??
          "-",
      })) || [],
    hits: competitor?.hits ?? "-",
    errors: competitor?.errors ?? "-",
  };
}

export async function getGameById(gameId) {
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary` +
    `?event=${gameId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const competition =
    data.header?.competitions?.[0];

  if (!competition) {
    throw new Error("Game data not found.");
  }

  const gameDate = new Date(competition.date);
  const today = new Date();

  const isPastGame =
    getDateKey(gameDate) < getDateKey(today);

  const awayCompetitor =
    competition.competitors?.find(
      (team) => team.homeAway === "away"
    );

  const homeCompetitor =
    competition.competitors?.find(
      (team) => team.homeAway === "home"
    );

  const awayBoxscore =
    data.boxscore?.players?.find(
      (team) =>
        String(team.team.id) ===
        String(awayCompetitor?.team?.id)
    );

  const homeBoxscore =
    data.boxscore?.players?.find(
      (team) =>
        String(team.team.id) ===
        String(homeCompetitor?.team?.id)
    );

  const currentMatchup = getCurrentMatchup(
    data,
    competition,
    awayBoxscore,
    homeBoxscore
  );

  return {
    id: data.header?.id || gameId,
    date: competition.date,
    isPastGame,

    status: {
      state: competition.status?.type?.state,
      detail: competition.status?.type?.detail,
      completed:
        competition.status?.type?.completed,
    },

    liveCount: getLiveCount(
      data,
      competition
    ),

    currentPitcher:
      currentMatchup?.pitcher || null,

    currentBatter:
      currentMatchup?.batter || null,

    venue: {
      name: competition.venue?.fullName || null,
      city:
        competition.venue?.address?.city || null,
      state:
        competition.venue?.address?.state || null,
    },

    awayTeam: {
      id: awayCompetitor?.team?.id,
      name: awayCompetitor?.team?.displayName,
      abbreviation:
        awayCompetitor?.team?.abbreviation,
      logo: getTeamLogo(awayCompetitor),
      score: awayCompetitor?.score,

      linescores: getLinescores(
        awayCompetitor
      ),

      probablePitcher: isPastGame
        ? null
        : getProbablePitcher(awayCompetitor),

      pitchers: getTeamPitchers(
        awayBoxscore || {}
      ),

      batters: getTeamBatters(
        awayBoxscore || {}
      ),

      lineup: getTeamLineup(
        awayBoxscore || {}
      ),

      injuries: isPastGame
        ? []
        : getTeamInjuries(
            data,
            awayCompetitor?.team?.id
          ),
    },

    homeTeam: {
      id: homeCompetitor?.team?.id,
      name: homeCompetitor?.team?.displayName,
      abbreviation:
        homeCompetitor?.team?.abbreviation,
      logo: getTeamLogo(homeCompetitor),
      score: homeCompetitor?.score,

      linescores: getLinescores(
        homeCompetitor
      ),

      probablePitcher: isPastGame
        ? null
        : getProbablePitcher(homeCompetitor),

      pitchers: getTeamPitchers(
        homeBoxscore || {}
      ),

      batters: getTeamBatters(
        homeBoxscore || {}
      ),

      lineup: getTeamLineup(
        homeBoxscore || {}
      ),

      injuries: isPastGame
        ? []
        : getTeamInjuries(
            data,
            homeCompetitor?.team?.id
          ),
    },
  };
}