
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/leagues/nfl.css";

const PREDICTION_API_URL =
  import.meta.env.VITE_PREDICTION_API_URL ||
  "https://sports-prediction-engine.onrender.com";

const NHL_TEAM_ABBREVIATIONS = {
  "Anaheim Ducks": "ana",
  "Boston Bruins": "bos",
  "Buffalo Sabres": "buf",
  "Calgary Flames": "cgy",
  "Carolina Hurricanes": "car",
  "Chicago Blackhawks": "chi",
  "Colorado Avalanche": "col",
  "Columbus Blue Jackets": "cbj",
  "Dallas Stars": "dal",
  "Detroit Red Wings": "det",
  "Edmonton Oilers": "edm",
  "Florida Panthers": "fla",
  "Los Angeles Kings": "la",
  "Minnesota Wild": "min",
  "Montreal Canadiens": "mtl",
  "Nashville Predators": "nsh",
  "New Jersey Devils": "nj",
  "New York Islanders": "nyi",
  "New York Rangers": "nyr",
  "Ottawa Senators": "ott",
  "Philadelphia Flyers": "phi",
  "Pittsburgh Penguins": "pit",
  "San Jose Sharks": "sj",
  "Seattle Kraken": "sea",
  "St. Louis Blues": "stl",
  "Tampa Bay Lightning": "tb",
  "Toronto Maple Leafs": "tor",
  "Utah Mammoth": "utah",
  "Utah Hockey Club": "utah",
  "Vancouver Canucks": "van",
  "Vegas Golden Knights": "vgk",
  "Washington Capitals": "wsh",
  "Winnipeg Jets": "wpg",
};

function getTeamLogo(teamName) {
  const abbreviation = NHL_TEAM_ABBREVIATIONS[teamName];

  if (!abbreviation) {
    return "";
  }

  return `https://a.espncdn.com/i/teamlogos/nhl/500/${abbreviation}.png`;
}

function formatOdds(odds) {
  if (odds == null) {
    return "N/A";
  }

  return odds > 0 ? `+${odds}` : odds;
}

function formatLine(line) {
  if (line == null) {
    return "N/A";
  }

  return line > 0 ? `+${line}` : line;
}

function formatNumber(value) {
  if (value == null) {
    return "N/A";
  }

  return Number(value).toFixed(2);
}

function formatPercentage(value) {
  if (value == null) {
    return "N/A";
  }

  return `${(Number(value) * 100).toFixed(1)}%`;
}

export default function NHLPredictionPage() {
  const { gameId } = useParams();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [oddsDisplay, setOddsDisplay] = useState("odds");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPrediction() {
      setLoading(true);
      setError("");
      setPrediction(null);

      try {
        const response = await fetch(
          `${PREDICTION_API_URL}/nhl/${gameId}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load NHL prediction");
        }

        const data = await response.json();

        setPrediction(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPrediction();

    return () => controller.abort();
  }, [gameId]);

  if (loading) {
    return <p>Loading NHL prediction...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!prediction) {
    return <p>Prediction not found.</p>;
  }

  const winner = prediction.winner || {};
  const puckLine = prediction.puck_line || {};
  const total = prediction.total || {};
  const skaters = prediction.skaters || [];
  const goalies = prediction.goalies || [];
  const marketOdds = prediction.market_odds || {};
  const moneylineValue = prediction.moneyline_value || [];
  const marketComparison = prediction.market_comparison || {};
  const puckMarket = marketComparison.puck_line;
  const totalMarket = marketComparison.total;
  const bestMoneyline = moneylineValue.find((item) => item.expected_value > 0);
  const sportsbook = marketOdds.provider || "Sportsbook";

  return (
    <main className="prediction-page">
      <div className="game-nav">
        <Link to={`/nhl/game/${gameId}`}>
          ← Back to Game
        </Link>
      </div>

      <div className="prediction-header">
        <span>SPORTS PREDICTION ENGINE</span>

        <div className="prediction-matchup">
          <div className="prediction-team">
            <img
              src={getTeamLogo(prediction.away_team)}
              alt={prediction.away_team}
            />

            <strong>{prediction.away_team}</strong>
            <span>Away</span>
          </div>

          <div className="prediction-at">
            <span>AT</span>
          </div>

          <div className="prediction-team">
            <img
              src={getTeamLogo(prediction.home_team)}
              alt={prediction.home_team}
            />

            <strong>{prediction.home_team}</strong>
            <span>Home</span>
          </div>
        </div>
      </div>

      <div className="prediction-grid">
        <section className="prediction-card prediction-primary">
          <span className="prediction-label">
            WINNER / MONEYLINE
          </span>

          <h2>{winner.pick || "Unavailable"}</h2>

          <div className="game-tabs">
            <button
              type="button"
              className={oddsDisplay === "odds" ? "active" : ""}
              onClick={() => setOddsDisplay("odds")}
            >
              Odds
            </button>

            <button
              type="button"
              className={oddsDisplay === "percent" ? "active" : ""}
              onClick={() => setOddsDisplay("percent")}
            >
              %
            </button>
          </div>

          <div className="prediction-big-number">
            {oddsDisplay === "odds"
              ? formatOdds(winner.fair_odds)
              : formatPercentage(winner.probability)}
          </div>

          <span className="prediction-detail">
            {oddsDisplay === "odds"
              ? "Model Fair Odds"
              : "Model Win Probability"}
          </span>

          <div className="prediction-row">
            <span>{prediction.away_team}</span>
            <strong>
              {formatPercentage(winner.away_probability)}
            </strong>
          </div>

          <div className="prediction-row">
            <span>{prediction.home_team}</span>
            <strong>
              {formatPercentage(winner.home_probability)}
            </strong>
          </div>

          <div style={{ marginTop: 18, borderTop: "1px solid #444", paddingTop: 14 }}>
            <span className="prediction-label">SPORTSBOOK MONEYLINE · {sportsbook}</span>
            {moneylineValue.length ? (
              moneylineValue.map((item) => (
                <div className="prediction-row" key={item.team}>
                  <span>{item.team} {formatOdds(item.market_odds)}</span>
                  <strong>EV {formatPercentage(item.expected_value)}</strong>
                </div>
              ))
            ) : (
              <p className="prediction-detail">Sportsbook odds unavailable.</p>
            )}
            {bestMoneyline && (
              <>
                <div className="prediction-row">
                  <span>Best positive EV</span>
                  <strong>{bestMoneyline.team}</strong>
                </div>
                <div className="prediction-row">
                  <span>Model / Break-even</span>
                  <strong>
                    {formatPercentage(bestMoneyline.model_probability)} / {formatPercentage(bestMoneyline.breakeven_probability)}
                  </strong>
                </div>
                <div className="prediction-row">
                  <span>Probability edge</span>
                  <strong>{formatPercentage(bestMoneyline.edge)}</strong>
                </div>
              </>
            )}
            {!bestMoneyline && moneylineValue.length > 0 && (
              <p className="prediction-detail">No positive moneyline expected value.</p>
            )}
          </div>
        </section>

        <section className="prediction-card">
          <span className="prediction-label">
            PUCK LINE PREDICTION
          </span>

          <h2>
            {puckLine.team || "Unavailable"}{" "}
            {formatLine(puckLine.line)}
          </h2>

          <div className="prediction-row">
            <span>Predicted Home Margin</span>
            <strong>
              {formatLine(
                puckLine.predicted_home_margin == null
                  ? null
                  : Number(
                      puckLine.predicted_home_margin
                    ).toFixed(2)
              )}
            </strong>
          </div>

          {puckMarket && (
            <>
              <div className="prediction-row">
                <span>{sportsbook} home puck line</span>
                <strong>{prediction.home_team} {formatLine(puckMarket.market_home_line)}</strong>
              </div>
              <div className="prediction-row">
                <span>Home / Away odds</span>
                <strong>{formatOdds(puckMarket.home_odds)} / {formatOdds(puckMarket.away_odds)}</strong>
              </div>
              <div className="prediction-row">
                <span>Model lean</span>
                <strong>
                  {puckMarket.lean === "home"
                    ? prediction.home_team
                    : puckMarket.lean === "away"
                      ? prediction.away_team
                      : "Even"}
                </strong>
              </div>
              <div className="prediction-row">
                <span>Home-side margin vs line</span>
                <strong>{formatNumber(puckMarket.margin_edge)} goals</strong>
              </div>
              <p className="prediction-detail">Goal-margin comparison, not a calculated betting EV.</p>
            </>
          )}
        </section>

        <section className="prediction-card">
          <span className="prediction-label">
            TOTAL GOALS PREDICTION
          </span>

          <div className="prediction-big-number">
            {formatNumber(total.predicted_total)}
          </div>

          <span className="prediction-detail">
            Projected Combined Goals
          </span>

          {totalMarket && (
            <>
              <div className="prediction-row">
                <span>{sportsbook} total</span>
                <strong>{formatNumber(totalMarket.market_line)}</strong>
              </div>
              <div className="prediction-row">
                <span>Over / Under odds</span>
                <strong>{formatOdds(totalMarket.over_odds)} / {formatOdds(totalMarket.under_odds)}</strong>
              </div>
              <div className="prediction-row">
                <span>Model lean</span>
                <strong>{totalMarket.lean?.toUpperCase() || "N/A"}</strong>
              </div>
              <div className="prediction-row">
                <span>Projected difference</span>
                <strong>{formatLine(totalMarket.goal_edge)} goals</strong>
              </div>
              <p className="prediction-detail">Goal-total comparison, not a calculated betting EV.</p>
            </>
          )}
        </section>
      </div>

      <section className="prediction-card">
        <span className="prediction-label">
          SKATER PROJECTIONS
        </span>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "right" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Player</th>
                <th>SOG</th>
                <th>PTS</th>
                <th>G</th>
                <th>A</th>
              </tr>
            </thead>

            <tbody>
              {skaters.map((player, index) => (
                <tr key={`${player.team}-${player.player}-${index}`}>
                  <td style={{ textAlign: "left" }}>
                    <strong>{player.player}</strong>
                    <div>
                      {player.team}
                      {player.position
                        ? ` · ${player.position}`
                        : ""}
                    </div>
                  </td>

                  <td>{formatNumber(player.shots_on_goal)}</td>
                  <td>{formatNumber(player.points)}</td>
                  <td>{formatNumber(player.goals)}</td>
                  <td>{formatNumber(player.assists)}</td>
                </tr>
              ))}

              {skaters.length === 0 && (
                <tr>
                  <td colSpan="5">
                    No skater projections available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="prediction-detail">
          Model stat projections, not sportsbook lines or
          over/under probabilities.
        </p>
      </section>

      <section className="prediction-card">
        <span className="prediction-label">
          GOALIE SAVES
        </span>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Goalie</th>
                <th style={{ textAlign: "right" }}>
                  Projected Saves
                </th>
              </tr>
            </thead>

            <tbody>
              {goalies.map((goalie, index) => (
                <tr key={`${goalie.team}-${goalie.player}-${index}`}>
                  <td>
                    <strong>{goalie.player}</strong>
                    <div>{goalie.team}</div>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {formatNumber(goalie.saves)}
                  </td>
                </tr>
              ))}

              {goalies.length === 0 && (
                <tr>
                  <td colSpan="2">
                    No goalie projections available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="prediction-detail">
          Multiple goalies may appear until the expected
          starter is identified.
        </p>
      </section>
    </main>
  );
}
