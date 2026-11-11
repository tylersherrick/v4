
import { gradeSelection } from "./betGrading.js";
import { getScore } from "./gameHelpers.js";

function getFirstPeriodScore(team) {
  const period = team?.periodScores?.find(
    (item) => Number(item.period) === 1
  );

  if (!period) {
    return null;
  }

  const score = Number(period.score);
  return Number.isFinite(score) ? score : null;
}

function formatNumber(value) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}

function getDescription(status, difference) {
  if (status === "pending") {
    return "Waiting for game to start";
  }

  if (status === "push") {
    return "Push";
  }

  if (status === "won") {
    return `Won by ${formatNumber(difference)}`;
  }

  if (status === "lost") {
    return `Lost by ${formatNumber(Math.abs(difference))}`;
  }

  if (difference > 0) {
    return `Ahead by ${formatNumber(difference)}`;
  }

  if (difference < 0) {
    return `Behind by ${formatNumber(Math.abs(difference))}`;
  }

  return "Tied";
}

function getTotalProgress(selection, total, status) {
  const line = Number(selection.line);

  if (!Number.isFinite(line) || line < 0) {
    return null;
  }

  const isOver = selection.direction === "over";
  const target = isOver ? Math.floor(line) + 1 : Math.ceil(line) - 1;
  const difference = isOver ? total - line : line - total;

  let percentage;

  if (isOver) {
    percentage = target > 0 ? (total / target) * 100 : 100;
  } else {
    percentage =
      total === 0
        ? 100
        : Math.min(100, ((target + 1) / (total + 1)) * 100);
  }

  if (status === "won" || status === "push") {
    percentage = 100;
  }

  return {
    percentage: Math.max(0, Math.min(100, percentage)),
    current: total,
    target: line,
    label: `${formatNumber(total)} / ${formatNumber(line)}`,
    description: getDescription(status, difference),
    status,
  };
}

function getMarginProgress(selection, awayScore, homeScore, status) {
  const selectedScore =
    selection.team === "away" ? awayScore : homeScore;

  const opponentScore =
    selection.team === "away" ? homeScore : awayScore;

  const spread =
    selection.market === "spread" ? Number(selection.line) : 0;

  if (!Number.isFinite(spread)) {
    return null;
  }

  const margin = selectedScore - opponentScore;
  const adjustedMargin = margin + spread;

  let percentage = Math.max(
    0,
    Math.min(100, 50 + adjustedMargin * 10)
  );

  if (status === "won" || status === "push") {
    percentage = 100;
  }

  return {
    percentage,
    current: margin,
    target: -spread,
    label: `${formatNumber(selectedScore)} - ${formatNumber(opponentScore)}`,
    description: getDescription(status, adjustedMargin),
    status,
  };
}

export function getBetProgress(selection, game) {
  const status =
    selection.finalResult || gradeSelection(selection, game);

  if (!game) {
    return {
      percentage: 0,
      label: "No score available",
      description: "Waiting for game data",
      status,
    };
  }

  if (selection.market === "first_period_total") {
    const awayScore = getFirstPeriodScore(game.awayTeam);
    const homeScore = getFirstPeriodScore(game.homeTeam);

    if (awayScore === null || homeScore === null) {
      return {
        percentage: 0,
        label: "1st period score unavailable",
        description: "Waiting for period data",
        status,
      };
    }

    return getTotalProgress(
      selection,
      awayScore + homeScore,
      status
    );
  }

  const awayScore = getScore(game.awayTeam);
  const homeScore = getScore(game.homeTeam);

  if (awayScore === null || homeScore === null) {
    return {
      percentage: 0,
      label: "Score unavailable",
      description: "Waiting for score data",
      status,
    };
  }

  if (selection.market === "total") {
    return getTotalProgress(
      selection,
      awayScore + homeScore,
      status
    );
  }

  if (
    selection.market === "moneyline" ||
    selection.market === "spread"
  ) {
    return getMarginProgress(
      selection,
      awayScore,
      homeScore,
      status
    );
  }

  return null;
}
