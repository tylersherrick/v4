
import { useState } from "react";
import BetProgress from "./BetProgress.jsx";
import { gradeSelection } from "./utils/betGrading.js";
import { getGameKey, getScore } from "./utils/gameHelpers.js";

function formatSelection(selection) {
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

function formatAmount(amount, unitType) {
  if (unitType === "dollars") {
    return `$${Number(amount).toFixed(2)}`;
  }

  return `${Number(amount)}u`;
}

function formatSignedAmount(amount, unitType) {
  const value = Number(amount);

  if (value > 0) {
    return `+${formatAmount(value, unitType)}`;
  }

  if (value < 0) {
    return `-${formatAmount(Math.abs(value), unitType)}`;
  }

  return formatAmount(0, unitType);
}

function getFinancials(bet) {
  const risk = Number(bet.risk);
  const potentialProfit = Number(bet.toWin);

  if (bet.status !== "closed") {
    return {
      profit: potentialProfit,
      totalReturn: risk + potentialProfit,
      settled: false,
    };
  }

  if (bet.result === "won") {
    return {
      profit: potentialProfit,
      totalReturn: risk + potentialProfit,
      settled: true,
    };
  }

  if (bet.result === "lost") {
    return {
      profit: -risk,
      totalReturn: 0,
      settled: true,
    };
  }

  if (bet.result === "push") {
    return {
      profit: 0,
      totalReturn: risk,
      settled: true,
    };
  }

  return {
    profit: potentialProfit,
    totalReturn: risk + potentialProfit,
    settled: false,
  };
}

function getGameStatus(game) {
  if (!game) {
    return "Score unavailable";
  }

  if (game.status?.state === "post") {
    return game.status.detail || "Final";
  }

  if (game.status?.state === "in") {
    return game.status.detail || "Live";
  }

  if (game.status?.state === "pre") {
    return "Upcoming";
  }

  return game.status?.detail || "Status unavailable";
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pending",
    winning: "Winning",
    losing: "Losing",
    tied: "Tied",
    won: "Won",
    lost: "Lost",
    push: "Push",
    review: "Review",
  };

  return labels[status] || "Pending";
}

function getFirstPeriodScore(team) {
  const firstPeriod = team?.periodScores?.find(
    (period) => Number(period.period) === 1
  );

  if (!firstPeriod) {
    return null;
  }

  const score = Number(firstPeriod.score);

  return Number.isFinite(score) ? score : null;
}

function getSelectionScore(selection, game) {
  if (!game) {
    return null;
  }

  if (selection.market === "first_period_total") {
    const awayScore = getFirstPeriodScore(game.awayTeam);
    const homeScore = getFirstPeriodScore(game.homeTeam);

    if (awayScore === null || homeScore === null) {
      return null;
    }

    return `1st Period: ${selection.awayTeam} ${awayScore} - ${homeScore} ${selection.homeTeam}`;
  }

  return `${selection.awayTeam} ${getScore(game.awayTeam) ?? "-"} - ${getScore(game.homeTeam) ?? "-"} ${selection.homeTeam}`;
}

export default function BetCard({
  bet,
  liveGames = {},
  defaultExpanded = false,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const selections = bet.selections || [];
  const isParlay = bet.type === "parlay";
  const firstSelection = selections[0];
  const financials = getFinancials(bet);

  const headline = isParlay
    ? `${selections.length}-Leg Parlay`
    : firstSelection
      ? formatSelection(firstSelection)
      : "Straight Bet";

  const subtitle = isParlay
    ? selections.map(formatSelection).join(" · ")
    : firstSelection
      ? `${firstSelection.league?.toUpperCase()} · ${firstSelection.awayTeam} @ ${firstSelection.homeTeam}`
      : "";

  function handleDelete() {
    const betDetails = isParlay
      ? selections.map(formatSelection).join("\n")
      : firstSelection
        ? `${formatSelection(firstSelection)}\n${firstSelection.awayTeam} @ ${firstSelection.homeTeam}`
        : "Unknown Wager";

    const confirmed = window.confirm(
      `Are you sure you want to delete this wager?\n\n` +
      `${betDetails}\n\n` +
      `Risk: ${formatAmount(bet.risk, bet.unitType)}\n` +
      `Potential Profit: +${formatAmount(bet.toWin, bet.unitType)}\n\n` +
      "This cannot be undone."
    );

    if (confirmed) {
      onDelete?.(bet.id);
    }
  }

  return (
    <article className={`sweatzone-bet-card ${bet.status}`}>
      <button
        type="button"
        className="sweatzone-bet-card-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="sweatzone-bet-card-title">
          <div className="sweatzone-bet-card-heading">
            <strong>{headline}</strong>

            {!isParlay && (
              <span className="sweatzone-bet-type-label">
                Straight
              </span>
            )}

            {bet.status === "closed" && bet.result && (
              <span
                className={`sweatzone-bet-card-status ${bet.result}`}
              >
                {getStatusLabel(bet.result)}
              </span>
            )}
          </div>

          <small>{subtitle}</small>
        </div>

        <div className="sweatzone-bet-card-summary">
          <strong>
            {formatSignedAmount(financials.profit, bet.unitType)}
          </strong>

          <span className="sweatzone-bet-card-chevron">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="sweatzone-bet-card-body">
          <div className="sweatzone-bet-card-selections">
            {selections.map((selection, index) => {
              const game =
                selection.finalGame ||
                liveGames[getGameKey(selection)];

              const status =
                selection.finalResult || gradeSelection(selection, game);

              const selectionScore = getSelectionScore(selection, game);

              return (
                <div
                  key={`${selection.league}-${selection.gameId}-${index}`}
                  className="sweatzone-bet-card-selection"
                >
                  <div className="sweatzone-bet-card-selection-info">
                    <small>
                      {selection.league?.toUpperCase()} ·{" "}
                      {selection.awayTeam} @ {selection.homeTeam}
                    </small>

                    <strong>{formatSelection(selection)}</strong>

                    {selectionScore && (
                      <small>{selectionScore}</small>
                    )}

                    <small>{getGameStatus(game)}</small>
                  </div>

                  <span
                    className={`sweatzone-bet-card-status ${status}`}
                  >
                    {getStatusLabel(status)}
                  </span>

                  <BetProgress selection={selection} game={game} />
                </div>
              );
            })}
          </div>

          <div className="sweatzone-bet-card-footer">
            <div>
              <small>Risk</small>
              <strong>
                {formatAmount(bet.risk, bet.unitType)}
              </strong>
            </div>

            <div>
              <small>
                {financials.settled ? "Net Profit" : "Potential Profit"}
              </small>
              <strong>
                {formatSignedAmount(financials.profit, bet.unitType)}
              </strong>
            </div>

            <div>
              <small>
                {financials.settled ? "Total Return" : "Potential Return"}
              </small>
              <strong>
                {formatAmount(financials.totalReturn, bet.unitType)}
              </strong>
            </div>
          </div>

          <div className="sweatzone-bet-card-actions">
            <button
              type="button"
              className="sweatzone-delete-button"
              onClick={handleDelete}
            >
              Delete Wager
            </button>
          </div>
        </div>
      )}
    </article>
  );
}