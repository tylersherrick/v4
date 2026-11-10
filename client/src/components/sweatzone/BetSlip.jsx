
import { useState } from "react";

function formatSelection(selection) {
  if (selection.market === "moneyline") {
    const team =
      selection.team === "away"
        ? selection.awayTeam
        : selection.homeTeam;

    return `${team} Moneyline`;
  }

  if (selection.market === "spread") {
    const team =
      selection.team === "away"
        ? selection.awayTeam
        : selection.homeTeam;

    const line =
      selection.line > 0
        ? `+${selection.line}`
        : selection.line;

    return `${team} ${line}`;
  }

  return `${selection.direction === "over" ? "Over" : "Under"} ${selection.line}`;
}

function formatAmount(amount, unitType) {
  if (unitType === "dollars") {
    return `$${amount.toFixed(2)}`;
  }

  return `${Number(amount.toFixed(2))}u`;
}

export default function BetSlip({
  betType,
  selections,
  onRemove,
  onSubmit,
}) {
  const [expanded, setExpanded] = useState(false);
  const [unitType, setUnitType] = useState("units");
  const [risk, setRisk] = useState("");
  const [totalReturn, setTotalReturn] = useState("");

  const profit = Number(totalReturn) - Number(risk);

  const canSubmit =
    selections.length >= (betType === "parlay" ? 2 : 1) &&
    risk.trim() !== "" &&
    totalReturn.trim() !== "" &&
    Number.isFinite(Number(risk)) &&
    Number.isFinite(Number(totalReturn)) &&
    Number(risk) > 0 &&
    Number(totalReturn) > Number(risk);

  function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit({
      type: betType,
      selections,
      unitType,
      risk: Number(risk),
      toWin: Number(profit.toFixed(2)),
    });
  }

  return (
    <div className="sweatzone-slip">
      <button
        type="button"
        className="sweatzone-slip-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          {betType === "parlay" ? "Parlay" : "Straight Bet"} ·{" "}
          {selections.length}{" "}
          {selections.length === 1 ? "selection" : "selections"}
        </span>
        <span>{expanded ? "▼" : "▲"}</span>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit}>
          {selections.length === 0 ? (
            <p className="sweatzone-slip-empty">
              Choose a market to add your first selection.
            </p>
          ) : (
            <div className="sweatzone-slip-selections">
              {selections.map((selection, index) => (
                <div
                  className="sweatzone-slip-selection"
                  key={`${selection.league}-${selection.gameId}-${index}`}
                >
                  <div>
                    <small>
                      {selection.awayTeam} @ {selection.homeTeam}
                    </small>
                    <strong>{formatSelection(selection)}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label="Remove selection"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="sweatzone-slip-unit-toggle">
            <button
              type="button"
              className={unitType === "units" ? "active" : ""}
              onClick={() => setUnitType("units")}
            >
              Units
            </button>

            <button
              type="button"
              className={unitType === "dollars" ? "active" : ""}
              onClick={() => setUnitType("dollars")}
            >
              Dollars
            </button>
          </div>

          <div className="sweatzone-slip-amounts">
            <label>
              Risk ({unitType === "units" ? "units" : "$"})
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={risk}
                onChange={(event) => setRisk(event.target.value)}
              />
            </label>

            <label>
              Total Return ({unitType === "units" ? "units" : "$"})
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={totalReturn}
                onChange={(event) => setTotalReturn(event.target.value)}
              />
            </label>
          </div>

          <div className="sweatzone-slip-return">
            <span>Potential Profit</span>
            <strong>
              {formatAmount(
                risk !== "" && totalReturn !== ""
                  ? profit
                  : 0,
                unitType
              )}
            </strong>
          </div>

          <button
            type="submit"
            className="sweatzone-add-button sweatzone-slip-submit"
            disabled={!canSubmit}
          >
            Save Bet
          </button>
        </form>
      )}
    </div>
  );
}
