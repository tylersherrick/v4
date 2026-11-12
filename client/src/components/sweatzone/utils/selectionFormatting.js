
const playerMarkets = {
  shots: "Shots on Goal",
  goals: "Goals",
  assists: "Assists",
  points: "Points",
  blocked_shots: "Blocked Shots",
  saves: "Saves",
  goals_allowed: "Goals Allowed",
  time_on_ice: "Time on Ice",
};

export function isPlayerProp(selection) {
  return selection.category === "player";
}

export function formatTimeOnIce(seconds) {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return "--:--";
  }

  const minutes = Math.floor(value / 60);
  const remainingSeconds = Math.floor(value % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatSelection(selection) {
  if (isPlayerProp(selection)) {
    const market = playerMarkets[selection.market] || selection.market;
    const direction =
      selection.direction === "over" ? "Over" : "Under";

    const line =
      selection.market === "time_on_ice"
        ? formatTimeOnIce(selection.line)
        : selection.line;

    return `${selection.playerName} ${market} ${direction} ${line}`;
  }

  const team =
    selection.team === "away"
      ? selection.awayTeam
      : selection.homeTeam;

  if (selection.market === "moneyline") {
    return `${team} Moneyline`;
  }

  if (selection.market === "spread") {
    return `${team} ${selection.line > 0 ? "+" : ""}${selection.line}`;
  }

  if (selection.market === "total") {
    return `${selection.direction === "over" ? "Over" : "Under"} ${selection.line}`;
  }

  if (selection.market === "first_period_total") {
    return `1st Period ${selection.direction === "over" ? "Over" : "Under"} ${selection.line}`;
  }

  return "Unknown Selection";
}
