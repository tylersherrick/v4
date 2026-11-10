
import { useState } from "react";
import GameSelector from "./GameSelector.jsx";
import MarketSelector from "./MarketSelector.jsx";
import BetSlip from "./BetSlip.jsx";

export default function AddBet({ onBack, onSaveBet }) {
  const [betType, setBetType] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selections, setSelections] = useState([]);

  function handleGameSelect(game) {
    setSelectedGame(game);
    setSelectedMarket(null);
  }

  function handleBetTypeChange(type) {
    if (selections.length > 0 && type !== betType) {
      const confirmed = window.confirm(
        "Changing bet type will clear your selections. Continue?"
      );

      if (!confirmed) {
        return;
      }

      setSelections([]);
    }

    setBetType(type);
    setSelectedMarket(null);
  }

  function handleMarketSelect(selection) {
    setSelectedMarket(selection);

    if (!selection) {
      return;
    }

    if (betType === "straight") {
      setSelections([selection]);
    } else {
      setSelections((current) => {
        const duplicate = current.some(
          (item) =>
            item.gameId === selection.gameId &&
            item.league === selection.league &&
            item.market === selection.market &&
            item.team === selection.team &&
            item.direction === selection.direction &&
            item.line === selection.line
        );

        return duplicate ? current : [...current, selection];
      });
    }
  }

  function removeSelection(index) {
    setSelections((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function handleSubmit(bet) {
    onSaveBet?.({
      ...bet,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "active",
    });
  }

  return (
    <div className="sweatzone-add-page">
      <div className="sweatzone-add-header">
        <button
          type="button"
          className="sweatzone-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <h1>Add Bet</h1>
      </div>

      <h2>Choose Bet Type</h2>

      <div className="sweatzone-bet-types">
        <button
          type="button"
          className={betType === "straight" ? "selected" : ""}
          onClick={() => handleBetTypeChange("straight")}
        >
          <strong>Straight Bet</strong>
          <span>One selection</span>
        </button>

        <button
          type="button"
          className={betType === "parlay" ? "selected" : ""}
          onClick={() => handleBetTypeChange("parlay")}
        >
          <strong>Parlay</strong>
          <span>Multiple selections</span>
        </button>
      </div>

      {betType && (
        <GameSelector onGameSelect={handleGameSelect} />
      )}

      {selectedGame && (
        <MarketSelector
          key={`${selectedGame.league}-${selectedGame.id}`}
          game={selectedGame}
          onMarketSelect={handleMarketSelect}
        />
      )}

      {betType && (
        <BetSlip
          betType={betType}
          selections={selections}
          onRemove={removeSelection}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
