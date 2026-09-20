function getOffenseTeamId(play) {
  return (
    play?.teamParticipants?.find(
      (participant) =>
        participant.type === "offense"
    )?.id ||
    play?.end?.team?.id ||
    play?.start?.team?.id ||
    null
  );
}

function isUsableSituation(play) {
  return (
    play?.end?.down > 0 &&
    play?.end?.distance >= 0 &&
    play?.end?.yardLine >= 0
  );
}

function getCurrentSituation(drives, plays) {
  const driveList = Array.isArray(drives)
    ? drives
    : [];

  for (
    let index = driveList.length - 1;
    index >= 0;
    index -= 1
  ) {
    const drivePlays = driveList[index]?.plays || [];

    const play = [...drivePlays]
      .reverse()
      .find(isUsableSituation);

    if (play) {
      return {
        possession:
          play.end?.team?.id ||
          getOffenseTeamId(play),
        down: play.end.down,
        distance: play.end.distance,
        yardLine: play.end.yardLine,
        yardsToEndzone:
          play.end.yardsToEndzone ?? null,
        downDistanceText:
          play.end.downDistanceText || null,
        shortDownDistanceText:
          play.end.shortDownDistanceText || null,
        possessionText:
          play.end.possessionText || null,
      };
    }
  }

  const play = [...plays]
    .reverse()
    .find(isUsableSituation);

  if (!play) {
    return null;
  }

  return {
    possession:
      play.end?.team?.id ||
      getOffenseTeamId(play),
    down: play.end.down,
    distance: play.end.distance,
    yardLine: play.end.yardLine,
    yardsToEndzone:
      play.end.yardsToEndzone ?? null,
    downDistanceText:
      play.end.downDistanceText || null,
    shortDownDistanceText:
      play.end.shortDownDistanceText || null,
    possessionText:
      play.end.possessionText || null,
  };
}

function formatPlay(play) {
  return {
    id: play.id,
    type: play.type?.text || null,
    abbreviation:
      play.type?.abbreviation || null,
    text: play.text || null,
    quarter: play.period?.number || null,
    clock: play.clock?.displayValue || null,
    teamId: getOffenseTeamId(play),
    yards: play.statYardage ?? null,
    scoringPlay: play.scoringPlay === true,
    turnover: play.isTurnover === true,
    penalty: play.isPenalty === true,
    awayScore: play.awayScore ?? null,
    homeScore: play.homeScore ?? null,
    start: {
      down: play.start?.down ?? null,
      distance: play.start?.distance ?? null,
      yardLine: play.start?.yardLine ?? null,
      yardsToEndzone:
        play.start?.yardsToEndzone ?? null,
      text:
        play.start?.downDistanceText || null,
      possessionText:
        play.start?.possessionText || null,
      teamId: play.start?.team?.id || null,
    },
    end: {
      down: play.end?.down ?? null,
      distance: play.end?.distance ?? null,
      yardLine: play.end?.yardLine ?? null,
      yardsToEndzone:
        play.end?.yardsToEndzone ?? null,
      text:
        play.end?.downDistanceText || null,
      possessionText:
        play.end?.possessionText || null,
      teamId: play.end?.team?.id || null,
    },
  };
}

function formatDrive(drive) {
  return {
    id: drive.id,
    team: {
      id: drive.team?.id || null,
      name:
        drive.team?.displayName ||
        drive.team?.name ||
        null,
      abbreviation:
        drive.team?.abbreviation || null,
      logo:
        drive.team?.logos?.[0]?.href || null,
    },
    description: drive.description || null,
    result:
      drive.result ||
      drive.displayResult ||
      null,
    plays: drive.offensivePlays ?? null,
    yards: drive.yards ?? null,
    timeElapsed:
      drive.timeElapsed?.displayValue || null,
    start: {
      quarter:
        drive.start?.period?.number || null,
      yardLine: drive.start?.yardLine ?? null,
      text: drive.start?.text || null,
    },
    end: {
      quarter:
        drive.end?.period?.number || null,
      yardLine: drive.end?.yardLine ?? null,
      text: drive.end?.text || null,
    },
    isScore: drive.isScore === true,
    playByPlay:
      drive.plays?.map(formatPlay) || [],
  };
}

export function getGamecast(data) {
  const plays = data.plays || [];

  const drives =
    data.drives?.previous ||
    data.drives ||
    [];

  const driveList = Array.isArray(drives)
    ? drives
    : [];

  const currentDrive =
    driveList[driveList.length - 1] || null;

  const currentSituation =
    getCurrentSituation(driveList, plays);

  return {
    currentSituation,
    currentDrive: currentDrive
      ? formatDrive(currentDrive)
      : null,
    drives: driveList
      .map(formatDrive)
      .reverse(),
    recentPlays: plays
      .slice(-10)
      .reverse()
      .map(formatPlay),
  };
}