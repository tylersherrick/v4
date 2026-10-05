function getTeamId(play) {
  return (
    play?.team?.id ||
    play?.participants?.find(
      (participant) => participant?.team?.id
    )?.team?.id ||
    null
  );
}

function formatParticipant(participant) {
  return {
    id:
      participant?.athlete?.id ||
      participant?.id ||
      null,
    name:
      participant?.athlete?.displayName ||
      participant?.displayName ||
      null,
    shortName:
      participant?.athlete?.shortName ||
      participant?.shortName ||
      null,
    position:
      participant?.athlete?.position?.abbreviation ||
      participant?.position?.abbreviation ||
      null,
  };
}

function formatPlay(play) {
  return {
    id: play.id,
    type:
      play.type?.text ||
      play.type?.name ||
      null,
    text: play.text || null,
    period: play.period?.number || null,
    clock: play.clock?.displayValue || null,
    teamId: getTeamId(play),
    scoringPlay: play.scoringPlay === true,
    penalty: play.penalty === true,
    shootout: play.shootout === true,
    awayScore: play.awayScore ?? null,
    homeScore: play.homeScore ?? null,
    coordinate: {
      x: play.coordinate?.x ?? null,
      y: play.coordinate?.y ?? null,
    },
    participants:
      play.participants?.map(formatParticipant) || [],
  };
}

export function getGamecast(data) {
  const plays = Array.isArray(data.plays)
    ? data.plays
    : [];

  const formattedPlays = plays.map(formatPlay);

  const periods = formattedPlays.reduce(
    (result, play) => {
      if (!play.period) {
        return result;
      }

      if (!result[play.period]) {
        result[play.period] = [];
      }

      result[play.period].push(play);

      return result;
    },
    {}
  );

  const currentPlay =
    formattedPlays[formattedPlays.length - 1] || null;

  return {
    currentPlay,
    periods: Object.entries(periods)
      .map(([period, periodPlays]) => ({
        period: Number(period),
        plays: [...periodPlays].reverse(),
      }))
      .reverse(),
    recentPlays: formattedPlays
      .slice(-10)
      .reverse(),
  };
}