import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/leagues/nfl.css";

const PREDICTION_API_URL = "http://127.0.0.1:8000";

const NFL_TEAM_ABBREVIATIONS = {
  "Arizona Cardinals": "ari",
  "Atlanta Falcons": "atl",
  "Baltimore Ravens": "bal",
  "Buffalo Bills": "buf",
  "Carolina Panthers": "car",
  "Chicago Bears": "chi",
  "Cincinnati Bengals": "cin",
  "Cleveland Browns": "cle",
  "Dallas Cowboys": "dal",
  "Denver Broncos": "den",
  "Detroit Lions": "det",
  "Green Bay Packers": "gb",
  "Houston Texans": "hou",
  "Indianapolis Colts": "ind",
  "Jacksonville Jaguars": "jax",
  "Kansas City Chiefs": "kc",
  "Las Vegas Raiders": "lv",
  "Los Angeles Chargers": "lac",
  "Los Angeles Rams": "lar",
  "Miami Dolphins": "mia",
  "Minnesota Vikings": "min",
  "New England Patriots": "ne",
  "New Orleans Saints": "no",
  "New York Giants": "nyg",
  "New York Jets": "nyj",
  "Philadelphia Eagles": "phi",
  "Pittsburgh Steelers": "pit",
  "San Francisco 49ers": "sf",
  "Seattle Seahawks": "sea",
  "Tampa Bay Buccaneers": "tb",
  "Tennessee Titans": "ten",
  "Washington Commanders": "wsh",
};

export default function NFLPredictionPage() {
  const { gameId } = useParams();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrediction() {
      try {
        const response = await fetch(
          `${PREDICTION_API_URL}/nfl/${gameId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load prediction");
        }

        const data = await response.json();

        setPrediction(data);
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPrediction();
  }, [gameId]);

  if (loading) {
    return <p>Loading prediction...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!prediction) {
    return <p>Prediction not found.</p>;
  }

  const hasMoneylineValue =
    prediction.winner.value_pick &&
    prediction.winner.value_market_odds != null;

  const formatOdds = (odds) => {
    if (odds == null) return "N/A";
    return odds > 0 ? `+${odds}` : odds;
  };

  const formatLine = (line) => {
    if (line == null) return "N/A";
    return line > 0 ? `+${line}` : line;
  };

  const getTeamLogo = (teamName) => {
    const abbreviation = NFL_TEAM_ABBREVIATIONS[teamName];

    if (!abbreviation) return "";

    return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbreviation}.png`;
  };

  const spreadEdgeText = () => {
    const team = prediction.spread.edge_team;
    const modelLine = prediction.spread.model_line;
    const marketLine = prediction.spread.market_line;
    const edge = prediction.spread.edge;

    if (modelLine < marketLine) {
      return `Model expects ${team} to win by ${edge} more points than the market`;
    }

    if (modelLine > marketLine) {
      return `Model expects ${team} to keep the game ${edge} points closer than the market`;
    }

    return "Model and market agree on the spread";
  };

  const totalEdgeText = () => {
    const edge = prediction.total.edge;

    if (prediction.total.lean === "under") {
      return `Model projects ${edge} fewer points than the market`;
    }

    if (prediction.total.lean === "over") {
      return `Model projects ${edge} more points than the market`;
    }

    return "Model and market agree on the total";
  };

  return (
    <main className="prediction-page">
      <div className="game-nav">
        <Link to={`/nfl/game/${gameId}`}>
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
            WINNER PREDICTION
          </span>

          <h2>{prediction.winner.pick}</h2>

          <div className="prediction-big-number">
            {(prediction.winner.probability * 100).toFixed(1)}%
          </div>

          <span className="prediction-detail">
            Win Probability
          </span>

          <div className="prediction-row">
            <span>Model Fair Odds</span>
            <strong>
              {formatOdds(prediction.winner.fair_odds)}
            </strong>
          </div>

          <div className="prediction-row">
            <span>Market Moneyline</span>
            <strong>
              {formatOdds(prediction.winner.market_odds)}
            </strong>
          </div>
        </section>

        <section className="prediction-card">
          <span className="prediction-label">
            SPREAD PREDICTION
          </span>

          <div className="prediction-row">
            <span>Model Prediction</span>
            <strong>
              {prediction.spread.edge_team}{" "}
              {formatLine(prediction.spread.model_line)}
            </strong>
          </div>

          <div className="prediction-row">
            <span>Market Spread</span>
            <strong>
              {prediction.spread.edge_team}{" "}
              {formatLine(prediction.spread.market_line)}
            </strong>
          </div>

          <div className="prediction-row">
            <span>Model Edge</span>
            <strong>{prediction.spread.edge} pts</strong>
          </div>

          <div className="prediction-explanation">
            {spreadEdgeText()}
          </div>
        </section>

        <section className="prediction-card">
          <span className="prediction-label">
            TOTAL PREDICTION
          </span>

          <div className="prediction-row">
            <span>Model Prediction</span>
            <strong>
              {prediction.total.lean.toUpperCase()}{" "}
              {prediction.total.model_total}
            </strong>
          </div>

          <div className="prediction-row">
            <span>Market Total</span>
            <strong>{prediction.total.market_total}</strong>
          </div>

          <div className="prediction-row">
            <span>Model Edge</span>
            <strong>{prediction.total.edge} pts</strong>
          </div>

          <div className="prediction-explanation">
            {totalEdgeText()}
          </div>
        </section>

        {hasMoneylineValue && (
          <section className="prediction-card">
            <span className="prediction-label">
              MONEYLINE VALUE
            </span>

            <h2>{prediction.winner.value_pick}</h2>

            <div className="prediction-row">
              <span>Model Probability</span>
              <strong>
                {(
                  prediction.winner.value_model_probability * 100
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div className="prediction-row">
              <span>Model Fair Odds</span>
              <strong>
                {formatOdds(
                  prediction.winner.value_fair_odds
                )}
              </strong>
            </div>

            <div className="prediction-row">
              <span>Market Moneyline</span>
              <strong>
                {formatOdds(
                  prediction.winner.value_market_odds
                )}
              </strong>
            </div>

            <div className="prediction-row">
              <span>Model Edge</span>
              <strong>
                {(prediction.winner.value_edge * 100).toFixed(1)}%
              </strong>
            </div>

            <div className="prediction-row">
              <span>Expected Value</span>
              <strong>
                {(
                  prediction.winner.expected_value * 100
                ).toFixed(1)}
                %
              </strong>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}