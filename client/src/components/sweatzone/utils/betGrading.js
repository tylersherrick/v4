
import { getGameKey, getScore, isGameFinal } from "./gameHelpers.js";

function getFirstPeriodGoals(game) {
  const awayPeriod = game.awayTeam?.periodScores?.find(
    (period) => period.period === 1
  );
  const homePeriod = game.homeTeam?.periodScores?.find(
    (period) => period.period === 1
  );

  if (!awayPeriod || !homePeriod) {
    return null;
  }

  const awayGoals = Number(awayPeriod.score);
  const homeGoals = Number(homePeriod.score);

  if (!Number.isFinite(awayGoals) || !Number.isFinite(homeGoals)) {
    return null;
  }

  return awayGoals + homeGoals;
}

export function gradeSelection(selection, game) {
  if (!game || game.status?.state === "pre") {
    return "pending";
  }

  if (selection.market === "first_period_total") {
    const firstPeriodGoals = getFirstPeriodGoals(game);

    if (firstPeriodGoals === null) {
      return "pending";
    }

    const difference =
      selection.direction === "over"
        ? firstPeriodGoals - Number(selection.line)
        : Number(selection.line) - firstPeriodGoals;

    const firstPeriodComplete =
      isGameFinal(game) || Number(game.status?.period) > 1;

    if (difference > 0) {
      return firstPeriodComplete ? "won" : "winning";
    }

    if (difference < 0) {
      return firstPeriodComplete ? "lost" : "losing";
    }

    return firstPeriodComplete ? "push" : "tied";
  }

  const awayScore = getScore(game.awayTeam);
  const homeScore = getScore(game.homeTeam);

  if (awayScore === null || homeScore === null) {
    return "pending";
  }

  let difference;

  if (selection.market === "moneyline") {
    difference =
      selection.team === "away"
        ? awayScore - homeScore
        : homeScore - awayScore;
  } else if (selection.market === "spread") {
    const teamScore =
      selection.team === "away" ? awayScore : homeScore;
    const opponentScore =
      selection.team === "away" ? homeScore : awayScore;

    difference =
      teamScore + Number(selection.line) - opponentScore;
  } else if (selection.market === "total") {
    const total = awayScore + homeScore;

    difference =
      selection.direction === "over"
        ? total - Number(selection.line)
        : Number(selection.line) - total;
  } else {
    return "pending";
  }

  const completed = isGameFinal(game);

  if (difference > 0) {
    return completed ? "won" : "winning";
  }

  if (difference < 0) {
    return completed ? "lost" : "losing";
  }

  return completed ? "push" : "tied";
}

export function getBetResult(bet, liveGames) {
  const selections = bet.selections || [];

  if (selections.length === 0) {
    return null;
  }

  const results = selections.map((selection) => {
    if (selection.finalResult) {
      return selection.finalResult;
    }

    const game =
      selection.finalGame ||
      liveGames[getGameKey(selection)];

    return gradeSelection(selection, game);
  });

  if (bet.type === "straight") {
    return ["won", "lost", "push"].includes(results[0])
      ? results[0]
      : null;
  }

  if (results.includes("lost")) {
    return "lost";
  }

  if (!results.every((result) => ["won", "push"].includes(result))) {
    return null;
  }

  if (results.every((result) => result === "push")) {
    return "push";
  }

  if (results.includes("push")) {
    return "review";
  }

  return "won";
}