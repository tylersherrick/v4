
import { getBetProgress } from "./utils/betProgress.js";
import { getPlayerStat } from "./utils/nhlPlayerStats.js";
import { isGameFinal } from "./utils/gameHelpers.js";
import { isPlayerProp } from "./utils/selectionFormatting.js";

const statusColors = {
  pending: "#6b7280",
  winning: "#22c55e",
  won: "#22c55e",
  losing: "#ef4444",
  lost: "#ef4444",
  tied: "#eab308",
  push: "#eab308",
  review: "#6b7280",
};

function getPlayerProgress(selection, game, playerStats) {
  const savedValue = selection.finalPlayerStat;
  const liveValue = getPlayerStat(selection, playerStats);

  const value =
    savedValue !== undefined && savedValue !== null
      ? Number(savedValue)
      : liveValue;

  if (value === null || !Number.isFinite(value)) {
    return {
      percentage: 0,
      label: "Player stats unavailable",
      description: "Waiting for player stats",
      status: selection.finalResult || "pending",
    };
  }

  const line = Number(selection.line);

  if (!Number.isFinite(line)) {
    return null;
  }

  const difference =
    selection.direction === "over"
      ? value - line
      : line - value;

  const completed =
    Boolean(selection.finalResult) || isGameFinal(game);

  let status;

  if (difference > 0) {
    status = completed ? "won" : "winning";
  } else if (difference < 0) {
    status = completed ? "lost" : "losing";
  } else {
    status = completed ? "push" : "tied";
  }

  const target =
    selection.direction === "over"
      ? Math.floor(line) + 1
      : Math.ceil(line) - 1;

  let percentage;

  if (selection.direction === "over") {
    percentage =
      target > 0 ? (value / target) * 100 : 100;
  } else {
    percentage =
      value <= target
        ? 100
        : Math.max(0, 100 - (value - target) * 15);
  }

  if (status === "won" || status === "push") {
    percentage = 100;
  }

  percentage = Math.max(0, Math.min(100, percentage));

  const margin = Math.abs(difference);

  const description =
    status === "won"
      ? `Won by ${margin}`
      : status === "lost"
        ? `Lost by ${margin}`
        : status === "push"
          ? "Push"
          : status === "winning"
            ? `Ahead by ${margin}`
            : status === "losing"
              ? `Behind by ${margin}`
              : "Tied";

  return {
    percentage,
    label: `${value} / ${line}`,
    description,
    status: selection.finalResult || status,
  };
}

export default function BetProgress({
  selection,
  game,
  playerStats,
}) {
  const progress = isPlayerProp(selection)
    ? getPlayerProgress(selection, game, playerStats)
    : getBetProgress(selection, game);

  if (!progress) {
    return null;
  }

  const color =
    statusColors[progress.status] || statusColors.pending;

  const percentage = Number.isFinite(progress.percentage)
    ? Math.max(0, Math.min(100, progress.percentage))
    : 0;

  const isMarginMarket =
    selection.market === "moneyline" ||
    selection.market === "spread";

  return (
    <div className="sweatzone-bet-progress">
      <div className="sweatzone-bet-progress-header">
        <span>{progress.label}</span>
        <span style={{ color }}>{progress.description}</span>
      </div>

      <div
        className="sweatzone-bet-progress-track"
        role="progressbar"
        aria-label="Wager progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        style={{
          position: "relative",
          height: "10px",
          backgroundColor: "#374151",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          className="sweatzone-bet-progress-fill"
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "999px",
            transition:
              "width 0.3s ease, background-color 0.3s ease",
          }}
        />

        {isMarginMarket &&
          !["won", "lost", "push"].includes(progress.status) && (
            <div
              className="sweatzone-bet-progress-center"
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "#ffffff",
                opacity: 0.8,
              }}
            />
          )}
      </div>
    </div>
  );
}