import { useState } from "react";
import PlayerPropSelector from "./PlayerPropSelector.jsx";

export default function MarketSelector({ game, onMarketSelect }) {
  const [category, setCategory] = useState("game");
  const [market, setMarket] = useState("moneyline");
  const [team, setTeam] = useState("away");
  const [direction, setDirection] = useState("over");
  const [line, setLine] = useState("");

  const awayTeam = game.awayTeam;
  const homeTeam = game.homeTeam;

  const isTotalMarket =
    market === "total" || market === "first_period_total";

  function selectCategory(value) {
    setCategory(value);
    onMarketSelect(null);
  }

  function selectMarket(value) {
    setMarket(value);
    setLine("");
    onMarketSelect(null);
  }

  function addSelection() {
    const selection = {
      gameId: game.id,
      league: game.league,
      category: "game",
      market,
      team: isTotalMarket ? null : team,
      direction: isTotalMarket ? direction : null,
      line: market === "moneyline" ? null : Number(line),
      awayTeam: awayTeam.abbreviation,
      homeTeam: homeTeam.abbreviation,
      gameDate: game.date,
    };

    onMarketSelect(selection);
  }

  const requiresLine = market !== "moneyline";
  const validLine =
    !requiresLine ||
    (line.trim() !== "" && Number.isFinite(Number(line)));

  return (
    <section className="sweatzone-market-selector">
      <h2>Choose a Market</h2>

      <div className="sweatzone-market-tabs">
        <button
          type="button"
          className={category === "game" ? "active" : ""}
          onClick={() => selectCategory("game")}
        >
          Game Bet
        </button>

        <button
          type="button"
          className={category === "player" ? "active" : ""}
          onClick={() => selectCategory("player")}
        >
          Player Prop
        </button>
      </div>

      {category === "game" ? (
        <>
          <div className="sweatzone-market-types">
            <button
              type="button"
              className={market === "moneyline" ? "active" : ""}
              onClick={() => selectMarket("moneyline")}
            >
              Moneyline
            </button>

            <button
              type="button"
              className={market === "spread" ? "active" : ""}
              onClick={() => selectMarket("spread")}
            >
              Spread
            </button>

            <button
              type="button"
              className={market === "total" ? "active" : ""}
              onClick={() => selectMarket("total")}
            >
              Over/Under
            </button>

            {game.league?.toLowerCase() === "nhl" && (
              <button
                type="button"
                className={
                  market === "first_period_total" ? "active" : ""
                }
                onClick={() => selectMarket("first_period_total")}
              >
                1st Period Total
              </button>
            )}
          </div>

          {!isTotalMarket ? (
            <div className="sweatzone-market-teams">
              <button
                type="button"
                className={team === "away" ? "selected" : ""}
                onClick={() => {
                  setTeam("away");
                  onMarketSelect(null);
                }}
              >
                {awayTeam.abbreviation}
              </button>

              <button
                type="button"
                className={team === "home" ? "selected" : ""}
                onClick={() => {
                  setTeam("home");
                  onMarketSelect(null);
                }}
              >
                {homeTeam.abbreviation}
              </button>
            </div>
          ) : (
            <div className="sweatzone-market-teams">
              <button
                type="button"
                className={
                  direction === "over" ? "selected" : ""
                }
                onClick={() => {
                  setDirection("over");
                  onMarketSelect(null);
                }}
              >
                Over
              </button>

              <button
                type="button"
                className={
                  direction === "under" ? "selected" : ""
                }
                onClick={() => {
                  setDirection("under");
                  onMarketSelect(null);
                }}
              >
                Under
              </button>
            </div>
          )}

          {requiresLine && (
            <label className="sweatzone-market-line">
              Betting Line
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder={
                  market === "spread"
                    ? "-1.5"
                    : market === "first_period_total"
                      ? "1.5"
                      : "5.5"
                }
                value={line}
                onChange={(event) => {
                  setLine(event.target.value);
                  onMarketSelect(null);
                }}
              />
            </label>
          )}

          <button
            type="button"
            className="sweatzone-add-button"
            disabled={!validLine}
            onClick={addSelection}
          >
            Add Selection
          </button>
        </>
      ) : (
        <PlayerPropSelector
          game={game}
          onMarketSelect={onMarketSelect}
        />
      )}
    </section>
  );
}