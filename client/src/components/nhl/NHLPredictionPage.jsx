
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


function getTopSkaterProjections(skaters) {
  const categories = [
    { key: "shots_on_goal", label: "Shots on goal", weight: 1 },
    { key: "points", label: "Points", weight: 1 },
    { key: "goals", label: "Goals", weight: 1 },
    { key: "assists", label: "Assists", weight: 1 },
  ];

  // Rank within each stat category, rather than comparing goals to shots directly.
  const candidates = categories.flatMap((category) => {
    const valid = skaters
      .filter((player) => Number.isFinite(Number(player[category.key])) && player[category.key] != null)
      .sort((a, b) => Number(b[category.key]) - Number(a[category.key]));

    if (!valid.length || Number(valid[0][category.key]) <= 0) return [];

    return valid.map((player, index) => ({
      player,
      category: category.label,
      statKey: category.key,
      value: Number(player[category.key]),
      score: 1 - index / valid.length,
    }));
  });

  const selected = [];
  const used = new Set();

  for (const candidate of candidates.sort((a, b) => b.score - a.score || b.value - a.value)) {
    const key = String(candidate.player.player_id || `${candidate.player.team}-${candidate.player.player}`);
    if (used.has(key)) continue;
    selected.push({ ...candidate, rank: selected.length + 1, key });
    used.add(key);
    if (selected.length === 3) break;
  }

  return selected;
}

// Player props must come from the current game's API response, never a matchup snapshot.
function getPlayerPropMarket(prediction, item) {
  const sources = [prediction.player_props, prediction.player_prop_odds, prediction.market_odds?.player_props];
  const entries = sources.flatMap((source) => Array.isArray(source) ? source : Array.isArray(source?.markets) ? source.markets : Array.isArray(source?.players) ? source.players : []);
  const playerId = String(item.player.player_id ?? "");
  const playerName = String(item.player.player ?? "").trim().toLowerCase();
  const aliases = {
    shots_on_goal: ["shots_on_goal", "shots", "sog", "player_shots_on_goal"],
    points: ["points", "player_points"],
    goals: ["goals", "player_goals"],
    assists: ["assists", "player_assists"],
  };
  const market = entries.find((entry) => {
    const idMatch = playerId && String(entry.player_id ?? "") === playerId;
    const nameMatch = String(entry.player ?? entry.player_name ?? entry.name ?? "").trim().toLowerCase() === playerName;
    const category = String(entry.stat ?? entry.stat_type ?? entry.market ?? entry.category ?? entry.key ?? "").toLowerCase().replace(/\s+/g, "_");
    return (idMatch || nameMatch) && aliases[item.statKey]?.includes(category);
  });
  if (!market) return null;
  const line = market.line ?? market.point ?? market.threshold;
  if (line == null) return null;
  return { line, book: market.book ?? market.sportsbook ?? market.provider ?? "Sportsbook", over: market.over_odds ?? market.over ?? market.odds?.over };
}

function formatSignedPercentage(value) {
  if (value == null) return "N/A";
  const percent = (Number(value) * 100).toFixed(1);
  return `${value > 0 ? "+" : ""}${percent}%`;
}

function formatSignedNumber(value) {
  if (value == null) return "N/A";
  return `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}`;
}


const NHL_PREDICTION_STYLES = `
  .nhl-prediction-page {
    --nhl-border: #dce3eb;
    --nhl-muted: #64748b;
    --nhl-accent: #2563eb;
    color: #152238;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 60px;
    line-height: 1.5;
  }
  .nhl-prediction-page * { box-sizing: border-box; }
  .nhl-prediction-page .game-nav { margin-bottom: 22px; }
  .nhl-prediction-page .game-nav a { color: var(--nhl-accent); text-decoration: none; font-weight: 650; }
  .nhl-prediction-page .prediction-header { margin-bottom: 24px; }
  .nhl-prediction-page .prediction-header > span,
  .nhl-prediction-page .prediction-label { display: block; font-size: 12px; font-weight: 750; letter-spacing: .065em; color: var(--nhl-muted); }
  .nhl-prediction-page .prediction-header > span { margin-bottom: 14px; }
  .nhl-prediction-page .prediction-matchup {
    display: grid; grid-template-columns: minmax(0,1fr) 50px minmax(0,1fr);
    align-items: center; gap: 14px; padding: 24px;
    background: #fff; border: 1px solid var(--nhl-border); border-radius: 16px;
  }
  .nhl-prediction-page .prediction-team { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 5px; min-width: 0; }
  .nhl-prediction-page .prediction-team img { width: 76px; height: 76px; object-fit: contain; }
  .nhl-prediction-page .prediction-team strong { font-size: 18px; }
  .nhl-prediction-page .prediction-team span, .nhl-prediction-page .prediction-at { color: var(--nhl-muted); font-size: 13px; text-align: center; }
  .nhl-prediction-page .prediction-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; margin-bottom: 20px; }
  .nhl-prediction-page .prediction-primary { grid-column: 1 / -1; }
  .nhl-prediction-page .prediction-card {
    min-width: 0; padding: 22px; margin: 0;
    background: #fff; border: 1px solid var(--nhl-border); border-radius: 14px;
    box-shadow: 0 3px 12px rgba(15,23,42,.035);
  }
  .nhl-prediction-page .prediction-card h2 { font-size: 21px; margin: 10px 0 16px; color: #0f172a; }
  .nhl-prediction-page .prediction-big-number { font-size: 34px; font-weight: 800; letter-spacing: -.035em; margin-top: 8px; }
  .nhl-prediction-page .prediction-detail { display: block; color: var(--nhl-muted); font-size: 12px; margin: 5px 0 14px; }
  .nhl-prediction-page .prediction-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px solid #edf1f5; font-size: 14px; }
  .nhl-prediction-page .prediction-row > span { color: #475569; }
  .nhl-prediction-page .prediction-row strong { text-align: right; font-weight: 700; }
  .nhl-prediction-page .game-tabs { display: inline-flex; gap: 3px; padding: 4px; border-radius: 10px; background: #eef2f7; margin: 8px 0; }
  .nhl-prediction-page .game-tabs button { border: 0; background: transparent; padding: 8px 16px; border-radius: 8px; color: #64748b; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
  .nhl-prediction-page .game-tabs button.active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 5px rgba(0,0,0,.08); }
  .nhl-prediction-page .player-projections { margin-top: 0; }
  .nhl-prediction-page .nhl-collapse-section { min-width: 0; }
  .nhl-prediction-page .nhl-collapse-section.nhl-full-width { grid-column: 1 / -1; }
  .nhl-prediction-page .nhl-collapse-button { display: none; }
  .nhl-prediction-page .nhl-top-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 14px 0 20px; }
  .nhl-prediction-page .nhl-top-pick { border: 1px solid #dce3eb; border-radius: 12px; padding: 14px; background: #f8fafc; }
  .nhl-prediction-page .nhl-top-rank { display: block; font-size: 12px; font-weight: 800; color: #475569; margin-bottom: 6px; }
  .nhl-prediction-page .nhl-top-pick strong { display: block; font-size: 15px; }
  .nhl-prediction-page .nhl-top-pick p { margin: 5px 0 0; font-size: 13px; color: #475569; }
  .nhl-prediction-page .nhl-featured-stat { background: #fff1c2; color: #92400e; font-weight: 850; border-radius: 6px; padding: 7px 10px; display: inline-block; }
  .nhl-prediction-page .nhl-featured-stat-label { display: block; color: #92400e; font-size: 10px; font-weight: 700; margin-top: 3px; white-space: nowrap; }
  .nhl-prediction-page .nhl-show-all { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; padding: 10px 16px; border: 1px solid #bfdbfe; border-radius: 9px; background: #eff6ff; color: #1d4ed8; font: inherit; font-size: 13px; font-weight: 750; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
  .nhl-prediction-page .nhl-show-all:hover { background: #dbeafe; border-color: #93c5fd; }
  .nhl-prediction-page .nhl-show-all:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
  .nhl-prediction-page .nhl-rank-tag { display: inline-block; margin-left: 8px; font-size: 11px; font-weight: 800; color: #92400e; }
  .nhl-prediction-page .nhl-skater-toggle { margin: 4px 0 18px; }
  .nhl-prediction-page .nhl-featured-skater-list { display: grid; gap: 10px; }
  .nhl-prediction-page .nhl-featured-skater-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
  .nhl-prediction-page .nhl-featured-skater-info { min-width: 0; }
  .nhl-prediction-page .nhl-featured-skater-info > strong { display: block; font-size: 16px; }
  .nhl-prediction-page .nhl-prop-market { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 12px; font-size: 12px; color: #475569; }
  .nhl-prediction-page .nhl-prop-market strong { color: #152238; }
  .nhl-prediction-page .nhl-skater-team { display: block; font-size: 12px; color: #64748b; margin-top: 3px; }
  .nhl-prediction-page .nhl-featured-skater-info p { margin: 8px 0 0; color: #64748b; font-size: 12px; max-width: 540px; }
  .nhl-prediction-page .nhl-featured-skater-number { flex: 0 0 auto; min-width: 100px; text-align: center; padding: 12px; background: #fff3cd; border-radius: 10px; color: #92400e; }
  .nhl-prediction-page .nhl-featured-skater-number strong { display: block; font-size: 24px; }
  .nhl-prediction-page .nhl-featured-skater-number span { display: block; font-size: 11px; font-weight: 750; }
  .nhl-prediction-page .nhl-skater-table-wrap { overflow-x: auto; }
  @media (max-width: 680px) {
    .nhl-prediction-page .nhl-featured-skater-card { padding: 12px; gap: 10px; }
    .nhl-prediction-page .nhl-featured-skater-number { min-width: 82px; padding: 10px 7px; }
    .nhl-prediction-page .nhl-featured-skater-number strong { font-size: 21px; }
    .nhl-prediction-page .nhl-skater-table-wrap table { min-width: 490px; }
  }


  .nhl-prediction-page .nhl-positive { color: #15803d; }
  .nhl-prediction-page .nhl-negative { color: #b91c1c; }
  .nhl-prediction-page .nhl-neutral { color: #475569; }
  .nhl-prediction-page .nhl-insight { background: #f5f8fc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-top: 14px; font-size: 13px; line-height: 1.55; color: #334155; }
  .nhl-prediction-page .nhl-insight strong { color: #0f172a; }
  .nhl-prediction-page .nhl-value-heading { margin: 16px 0 6px; font-size: 15px; font-weight: 750; }
  .nhl-prediction-page .nhl-value-subtitle { font-size: 12px; color: #64748b; margin: 0 0 8px; }
  .nhl-prediction-page .player-section-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
  .nhl-prediction-page table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .nhl-prediction-page th { color: #64748b; font-size: 12px; font-weight: 750; padding: 12px 10px; background: #f5f7fa; text-align: right; }
  .nhl-prediction-page th:first-child { text-align: left; }
  .nhl-prediction-page td { border-bottom: 1px solid #edf1f5; padding: 12px 10px; text-align: right; }
  .nhl-prediction-page td:first-child { text-align: left; }
  .nhl-prediction-page td div { color: #64748b; font-size: 12px; margin-top: 3px; }
  @media (max-width: 680px) {
    .nhl-prediction-page { padding: 16px 12px 36px; }
    .nhl-prediction-page .prediction-grid { grid-template-columns: 1fr; gap: 12px; }
    .nhl-prediction-page .nhl-collapse-section.nhl-full-width { grid-column: auto; }
    .nhl-prediction-page .nhl-collapse-button { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--nhl-border); border-radius: 12px; background: #fff; color: #152238; font: inherit; font-weight: 750; text-align: left; cursor: pointer; }
    .nhl-prediction-page .nhl-collapse-section.is-expanded .nhl-collapse-button { border-radius: 12px 12px 0 0; border-bottom: 0; }
    .nhl-prediction-page .nhl-collapse-section:not(.is-expanded) > .prediction-card { display: none; }
    .nhl-prediction-page .nhl-collapse-section.is-expanded > .prediction-card { border-radius: 0 0 12px 12px; }
    .nhl-prediction-page .nhl-top-three { grid-template-columns: 1fr; }

    .nhl-prediction-page .prediction-primary { grid-column: auto; }
    .nhl-prediction-page .prediction-card { padding: 16px; }
    .nhl-prediction-page .prediction-matchup { padding: 16px 10px; gap: 6px; grid-template-columns: minmax(0,1fr) 28px minmax(0,1fr); }
    .nhl-prediction-page .prediction-team img { width: 56px; height: 56px; }
    .nhl-prediction-page .prediction-team strong { font-size: 14px; }
    .nhl-prediction-page .prediction-row { font-size: 12px; }
    .nhl-prediction-page table { min-width: 490px; }
    .nhl-prediction-page .nhl-goalie-table-wrap { width: 100%; overflow-x: visible; }
    .nhl-prediction-page .nhl-goalie-table { width: 100%; min-width: 0; table-layout: fixed; }
    .nhl-prediction-page .nhl-goalie-table th:first-child,
    .nhl-prediction-page .nhl-goalie-table td:first-child { width: 62%; text-align: left; overflow-wrap: anywhere; }
    .nhl-prediction-page .nhl-goalie-table th:last-child,
    .nhl-prediction-page .nhl-goalie-table td:last-child { width: 38%; text-align: right; white-space: normal; }
    .nhl-prediction-page .nhl-goalie-table th,
    .nhl-prediction-page .nhl-goalie-table td { padding: 12px 5px; }
  }
`;

export default function NHLPredictionPage() {
  const { gameId } = useParams();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [oddsDisplay, setOddsDisplay] = useState("odds");
  const [playerTab, setPlayerTab] = useState("skaters");
  const [expandedSections, setExpandedSections] = useState({});
  const [showAllSkaters, setShowAllSkaters] = useState(false);

  function toggleSection(section) {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  }


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
  const projectedCandidates = getTopSkaterProjections(skaters);
  const topSkaters = projectedCandidates.map((item) => ({
    ...item,
    market: getPlayerPropMarket(prediction, item),
  }));
  const topSkaterRanks = new Map(topSkaters.map((item) => [item.key, item]));
  const displayedSkaters = showAllSkaters ? skaters : skaters.filter((player) => topSkaterRanks.has(String(player.player_id || `${player.team}-${player.player}`)));
  const predictedWinnerProbability = winner.probability;
  const bestMoneylineOdds = bestMoneyline?.market_odds;
  const puckLeanTeam = puckMarket?.lean === "home"
    ? prediction.home_team
    : puckMarket?.lean === "away"
      ? prediction.away_team
      : null;
  const puckLeanLine = puckMarket?.market_home_line == null
    ? null
    : puckMarket.lean === "home"
      ? Number(puckMarket.market_home_line)
      : -Number(puckMarket.market_home_line);
  const puckAdvantage = puckMarket?.margin_edge == null
    ? null
    : Math.abs(Number(puckMarket.margin_edge));
  const totalDirection = totalMarket?.lean === "over"
    ? "OVER"
    : totalMarket?.lean === "under"
      ? "UNDER"
      : null;
  const totalDifference = totalMarket?.goal_edge == null
    ? null
    : Math.abs(Number(totalMarket.goal_edge));

  return (
    <main className="prediction-page nhl-prediction-page">
      <style>{NHL_PREDICTION_STYLES}</style>
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
        <div className={`nhl-collapse-section nhl-full-width ${expandedSections.moneyline ? "is-expanded" : ""}`}>
          <button type="button" className="nhl-collapse-button" aria-expanded={Boolean(expandedSections.moneyline)} onClick={() => toggleSection("moneyline")}>Winner / Moneyline <span>{expandedSections.moneyline ? "−" : "+"}</span></button>
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

          <div className="nhl-insight">
            <strong>Most likely winner: {winner.pick || "Unavailable"}.</strong>{" "}
            {predictedWinnerProbability != null
              ? `Win probability: ${formatPercentage(predictedWinnerProbability)}.`
              : "The model's win probability is unavailable."}
          </div>

          <div style={{ marginTop: 18, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
            <span className="prediction-label">SPORTSBOOK MONEYLINE · {sportsbook}</span>
            <p className="nhl-value-subtitle">
              Model EV compared with sportsbook odds.
            </p>
            {moneylineValue.length ? (
              moneylineValue.map((item) => (
                <div className="prediction-row" key={item.team}>
                  <span>{item.team} · sportsbook {formatOdds(item.market_odds)}</span>
                  <strong className={item.expected_value > 0 ? "nhl-positive" : item.expected_value < 0 ? "nhl-negative" : "nhl-neutral"}>
                    {item.expected_value > 0 ? "Positive EV " : item.expected_value < 0 ? "Negative EV " : "EV "}
                    {formatSignedPercentage(item.expected_value)}
                  </strong>
                </div>
              ))
            ) : (
              <p className="prediction-detail">Sportsbook odds unavailable.</p>
            )}

            {bestMoneyline ? (
              <>
                <div className="nhl-value-heading nhl-positive">
                  Best positive moneyline value: {bestMoneyline.team} {formatOdds(bestMoneylineOdds)}
                </div>
                <div className="prediction-row">
                  <span>Model win probability</span>
                  <strong>{formatPercentage(bestMoneyline.model_probability)}</strong>
                </div>
                <div className="prediction-row">
                  <span>Win rate needed to break even at sportsbook odds</span>
                  <strong>{formatPercentage(bestMoneyline.breakeven_probability)}</strong>
                </div>
                <div className="prediction-row">
                  <span>Model advantage over break-even (percentage points)</span>
                  <strong className={bestMoneyline.edge > 0 ? "nhl-positive" : "nhl-neutral"}>
                    {formatSignedPercentage(bestMoneyline.edge)}
                  </strong>
                </div>
                <div className="nhl-insight">
                  <strong>What this means:</strong> The model sees {bestMoneyline.team} as a better price than the sportsbook requires to break even. A {formatPercentage(bestMoneyline.expected_value)} EV corresponds to approximately ${(bestMoneyline.expected_value * 100).toFixed(2)} expected profit per $100 wagered over many comparable bets.
                </div>
              </>
            ) : moneylineValue.length > 0 ? (
              <div className="nhl-insight">
                <strong>No positive-value moneyline identified.</strong> Both available sportsbook prices have zero or negative estimated EV according to the model.
              </div>
            ) : null}
          </div>
        </section>
        </div>

        <div className={`nhl-collapse-section ${expandedSections.puck ? "is-expanded" : ""}`}>
          <button type="button" className="nhl-collapse-button" aria-expanded={Boolean(expandedSections.puck)} onClick={() => toggleSection("puck")}>Puck Line <span>{expandedSections.puck ? "−" : "+"}</span></button>
        <section className="prediction-card">
          <span className="prediction-label">
            PUCK LINE PREDICTION
          </span>

          <h2>
            {puckLeanTeam && puckLeanLine != null
              ? `Model favors ${puckLeanTeam} ${formatLine(puckLeanLine)}`
              : `${puckLine.team || "Unavailable"} ${formatLine(puckLine.line)}`}
          </h2>

          <div className="prediction-row">
            <span>Model's predicted home-team goal margin</span>
            <strong>{formatSignedNumber(puckLine.predicted_home_margin)} goals</strong>
          </div>

          {puckMarket && (
            <>
              <div className="prediction-row">
                <span>{sportsbook} home-team puck line</span>
                <strong>{prediction.home_team} {formatLine(puckMarket.market_home_line)}</strong>
              </div>
              <div className="prediction-row">
                <span>Home / away sportsbook odds</span>
                <strong>{formatOdds(puckMarket.home_odds)} / {formatOdds(puckMarket.away_odds)}</strong>
              </div>
              <div className="prediction-row">
                <span>Model's preferred side</span>
                <strong>{puckLeanTeam || "No preference"}</strong>
              </div>
              <div className="prediction-row">
                <span>Projected margin advantage for preferred side</span>
                <strong>{puckAdvantage == null ? "N/A" : `${formatNumber(puckAdvantage)} goals`}</strong>
              </div>
              <div className="nhl-insight">
                {puckLeanTeam && puckLeanLine != null && puckAdvantage != null
                  ? `The model favors ${puckLeanTeam} ${formatLine(puckLeanLine)} by ${formatNumber(puckAdvantage)} goals against the sportsbook line.`
                  : "No clear puck-line preference."}
              </div>
            </>
          )}

        </section>
        </div>

        <div className={`nhl-collapse-section ${expandedSections.total ? "is-expanded" : ""}`}>
          <button type="button" className="nhl-collapse-button" aria-expanded={Boolean(expandedSections.total)} onClick={() => toggleSection("total")}>Total Goals <span>{expandedSections.total ? "−" : "+"}</span></button>
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
                <span>{sportsbook} over/under goal line</span>
                <strong>{formatNumber(totalMarket.market_line)}</strong>
              </div>
              <div className="prediction-row">
                <span>Over / under sportsbook odds</span>
                <strong>{formatOdds(totalMarket.over_odds)} / {formatOdds(totalMarket.under_odds)}</strong>
              </div>
              <div className="prediction-row">
                <span>Model's preferred total</span>
                <strong>
                  {totalDirection ? `${totalDirection} ${formatNumber(totalMarket.market_line)}` : "No preference"}
                </strong>
              </div>
              <div className="prediction-row">
                <span>Projected goals {totalDirection === "OVER" ? "above" : totalDirection === "UNDER" ? "below" : "from"} the line</span>
                <strong>{totalDifference == null ? "N/A" : `${formatNumber(totalDifference)} goals`}</strong>
              </div>
              <div className="nhl-insight">
                {totalDirection && totalDifference != null
                  ? `The model projects ${formatNumber(total.predicted_total)} combined goals, ${formatNumber(totalDifference)} ${totalDirection === "OVER" ? "above" : "below"} the sportsbook's ${formatNumber(totalMarket.market_line)}-goal line.`
                  : "The model projects a total close to the sportsbook line. No calculated betting EV is available for this market."}
              </div>
            </>
          )}

        </section>
        </div>
      </div>

      <div className={`nhl-collapse-section ${expandedSections.players ? "is-expanded" : ""}`}>
        <button type="button" className="nhl-collapse-button" aria-expanded={Boolean(expandedSections.players)} onClick={() => toggleSection("players")}>Player Projections <span>{expandedSections.players ? "−" : "+"}</span></button>
      <section className="prediction-card player-projections">
        <div className="player-section-header">
          <span className="prediction-label">PLAYER PROJECTIONS</span>
          <div className="game-tabs player-tabs" role="tablist" aria-label="Player projections">
            <button type="button" role="tab" aria-selected={playerTab === "skaters"} className={playerTab === "skaters" ? "active" : ""} onClick={() => setPlayerTab("skaters")}>Skaters ({skaters.length})</button>
            <button type="button" role="tab" aria-selected={playerTab === "goalies"} className={playerTab === "goalies" ? "active" : ""} onClick={() => setPlayerTab("goalies")}>Goalies ({goalies.length})</button>
          </div>
        </div>
        {playerTab === "skaters" && (
        <div>
        <span className="prediction-label">
          SKATER PROJECTIONS
        </span>



        {skaters.length > 3 && (
          <button type="button" className="nhl-show-all nhl-skater-toggle" aria-expanded={showAllSkaters} onClick={() => setShowAllSkaters((previous) => !previous)}>
            {showAllSkaters ? "↑ Show top 3 only" : `↓ Show all ${skaters.length} skaters`}
          </button>
        )}

        {!showAllSkaters && (
          <div className="nhl-featured-skater-list">
            {topSkaters.map((item) => (
              <div className="nhl-featured-skater-card" key={item.key}>
                <div className="nhl-featured-skater-info">
                  <span className="nhl-top-rank">PROJECTION {item.rank}</span>
                  <strong>{item.player.player}</strong>
                  <span className="nhl-skater-team">{item.player.team}{item.player.position ? ` · ${item.player.position}` : ""}</span>
                  <div className="nhl-prop-market">
                    {item.market ? (
                      <>
                        <span>{item.market.book}: <strong>{item.market.line}</strong></span>
                        <span>Model edge: <strong className={item.value > Number(item.market.line) ? "nhl-positive" : "nhl-negative"}>{formatSignedNumber(item.value - Number(item.market.line))}</strong></span>
                        {item.market.over != null && <span>Over <strong>{formatOdds(item.market.over)}</strong></span>}
                      </>
                    ) : (
                      <span>Sportsbook comparison pending live player-prop feed</span>
                    )}
                  </div>
                </div>
                <div className="nhl-featured-skater-number">
                  <strong>{formatNumber(item.value)}</strong>
                  <span>{item.category}</span>
                </div>
              </div>
            ))}
            {topSkaters.length === 0 && <p className="prediction-detail">No skater projections available.</p>}
          </div>
        )}

        {showAllSkaters && (
          <div className="nhl-skater-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>SOG</th>
                  <th>PTS</th>
                  <th>G</th>
                  <th>A</th>
                </tr>
              </thead>
              <tbody>
                {skaters.map((player, index) => (
                  <tr key={`${player.team}-${player.player}-${index}`}>
                    <td>
                      <strong>{player.player}</strong>
                      <div>{player.team}{player.position ? ` · ${player.position}` : ""}</div>
                    </td>
                    <td>{formatNumber(player.shots_on_goal)}</td>
                    <td>{formatNumber(player.points)}</td>
                    <td>{formatNumber(player.goals)}</td>
                    <td>{formatNumber(player.assists)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        </div>
        )}
        {playerTab === "goalies" && (
        <div>
        <span className="prediction-label">
          GOALIE SAVES
        </span>

        <div className="nhl-goalie-table-wrap">
          <table className="nhl-goalie-table" style={{ width: "100%" }}>
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
        </div>
        )}
      </section>
      </div>
    </main>
  );
}
