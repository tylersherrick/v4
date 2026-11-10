
export function getGameDate(gameDate) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(gameDate));

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}${month}${day}`;
}

export function getGameKey(selection) {
  return `${selection.league}-${selection.gameId}`;
}

export function getGameState(game) {
  return game?.status?.state || "pre";
}

export function isGameFinal(game) {
  return (
    game?.status?.state === "post" &&
    game.status?.completed === true
  );
}

export function getScore(team) {
  const score = team?.score;

  if (score === undefined || score === null || score === "") {
    return null;
  }

  const value =
    typeof score === "object"
      ? score.value ?? score.displayValue
      : score;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function createFinalGame(game) {
  return {
    id: game.id,
    date: game.date,
    status: {
      state: "post",
      detail: game.status?.detail || "Final",
      completed: true,
    },
    awayTeam: {
      abbreviation: game.awayTeam?.abbreviation,
      score: getScore(game.awayTeam),
    },
    homeTeam: {
      abbreviation: game.homeTeam?.abbreviation,
      score: getScore(game.homeTeam),
    },
  };
}
