
import { getBetProgress } from "./utils/betProgress.js";

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

export default function BetProgress({ selection, game }) {
  const progress = getBetProgress(selection, game);

  if (!progress) {
    return null;
  }

  const color = statusColors[progress.status] || statusColors.pending;

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
            transition: "width 0.3s ease, background-color 0.3s ease",
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
