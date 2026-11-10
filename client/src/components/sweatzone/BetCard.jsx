
import { useState } from "react";

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

  return "Unknown Selection";
}

function formatAmount(amount, unitType) {
  if (unitType === "dollars") {
    return `$${Number(amount).toFixed(2)}`;
  }

  return `${Number(amount)}u`;
}

export default function BetCard({
  bet,
  defaultExpanded = false,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const selections = bet.selections || [];
  const isParlay = bet.type === "parlay";
  const firstSelection = selections[0];

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
            `This cannot be undone.`
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
          </div>

          <small>{subtitle}</small>
        </div>

        <div className="sweatzone-bet-card-summary">
          <strong>
            +{formatAmount(bet.toWin, bet.unitType)}
          </strong>

          <span className="sweatzone-bet-card-chevron">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="sweatzone-bet-card-body">
          <div className="sweatzone-bet-card-selections">
            {selections.map((selection, index) => (
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
                </div>

                <span className="sweatzone-bet-card-status">
                  Pending
                </span>
              </div>
            ))}
          </div>

          <div className="sweatzone-bet-card-footer">
            <div>
              <small>Risk</small>
              <strong>
                {formatAmount(bet.risk, bet.unitType)}
              </strong>
            </div>

            <div>
              <small>Profit</small>
              <strong>
                +{formatAmount(bet.toWin, bet.unitType)}
              </strong>
            </div>

            <div>
              <small>Total Return</small>
              <strong>
                {formatAmount(
                  Number(bet.risk) + Number(bet.toWin),
                  bet.unitType
                )}
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
