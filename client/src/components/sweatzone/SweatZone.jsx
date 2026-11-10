
import { useEffect, useState } from "react";
import SportsNav from "../home/SportsNav.jsx";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import AddBet from "./AddBet.jsx";
import BetCard from "./BetCard.jsx";
import "../../styles/sweatzone.css";

const STORAGE_KEY = "sweatzone-bets";
const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_RENDER_API_URL;

function loadBets() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function getGameDate(gameDate) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(gameDate));

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}${month}${day}`;
}

function getGameKey(selection) {
  return `${selection.league}-${selection.gameId}`;
}

function getGameState(game) {
  return game?.status?.state || "pre";
}

function isGameFinal(game) {
  return (
    game?.status?.state === "post" &&
    game.status?.completed === true
  );
}

function getScore(team) {
  const score = team?.score;

  if (score === undefined || score === null || score === "") {
    return null;
  }

  const value =
    typeof score === "object"
      ? score.value ?? score.displayValue
      : score;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function gradeSelection(selection, game) {
  if (!game) {
    return "pending";
  }

  const state = getGameState(game);

  if (state === "pre") {
    return "pending";
  }

  const awayScore = getScore(game.awayTeam);
  const homeScore = getScore(game.homeTeam);

  if (awayScore === null || homeScore === null) {
    return "pending";
  }

  let difference;

  if (selection.market === "moneyline") {
    difference =
      selection.team === "away"
        ? awayScore - homeScore
        : homeScore - awayScore;
  } else if (selection.market === "spread") {
    const teamScore =
      selection.team === "away" ? awayScore : homeScore;
    const opponentScore =
      selection.team === "away" ? homeScore : awayScore;

    difference =
      teamScore + Number(selection.line) - opponentScore;
  } else if (selection.market === "total") {
    const total = awayScore + homeScore;
    const line = Number(selection.line);

    difference =
      selection.direction === "over"
        ? total - line
        : line - total;
  } else {
    return "pending";
  }

  const completed = isGameFinal(game);

  if (difference > 0) {
    return completed ? "won" : "winning";
  }

  if (difference < 0) {
    return completed ? "lost" : "losing";
  }

  return completed ? "push" : "tied";
}

function createFinalGame(game) {
  return {
    id: game.id,
    date: game.date,
    status: {
      state: "post",
      detail: game.status?.detail || "Final",
      completed: true,
    },
    awayTeam: {
      abbreviation: game.awayTeam?.abbreviation,
      score: getScore(game.awayTeam),
    },
    homeTeam: {
      abbreviation: game.homeTeam?.abbreviation,
      score: getScore(game.homeTeam),
    },
  };
}

function getBetResult(bet, liveGames) {
  const selections = bet.selections || [];

  if (selections.length === 0) {
    return null;
  }

  const results = selections.map((selection) => {
    if (selection.finalResult) {
      return selection.finalResult;
    }

    const game =
      selection.finalGame ||
      liveGames[getGameKey(selection)];

    return gradeSelection(selection, game);
  });

  if (bet.type === "straight") {
    return ["won", "lost", "push"].includes(results[0])
      ? results[0]
      : null;
  }

  if (results.includes("lost")) {
    return "lost";
  }

  if (!results.every((result) =>
    ["won", "push"].includes(result)
  )) {
    return null;
  }

  if (results.every((result) => result === "push")) {
    return "push";
  }

  if (results.includes("push")) {
    return "review";
  }

  return "won";
}

export default function SweatZone() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [sortBy, setSortBy] = useState("recent");
  const [betFilter, setBetFilter] = useState("all");
  const [showAddBet, setShowAddBet] = useState(false);
  const [bets, setBets] = useState(loadBets);
  const [liveGames, setLiveGames] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    if (!API_URL || !bets.some((bet) => bet.status === "active")) {
      return;
    }

    let cancelled = false;
    const requests = new Map();

    for (const bet of bets) {
      if (bet.status !== "active") {
        continue;
      }

      for (const selection of bet.selections || []) {
        if (
          selection.finalGame ||
          !selection.league ||
          !selection.gameDate
        ) {
          continue;
        }

        const date = getGameDate(selection.gameDate);
        const key = `${selection.league}-${date}`;

        if (!requests.has(key)) {
          requests.set(key, {
            league: selection.league,
            date,
          });
        }
      }
    }

    if (requests.size === 0) {
      return;
    }

    async function refreshScores() {
      const results = await Promise.allSettled(
        [...requests.values()].map(async ({ league, date }) => {
          const response = await fetch(
            `${API_URL}/api/${league}/games?date=${date}`
          );

          if (!response.ok) {
            throw new Error("Unable to load games");
          }

          const data = await response.json();

          return {
            league,
            games: Array.isArray(data) ? data : data.games || [],
          };
        })
      );

      if (cancelled) {
        return;
      }

      setLiveGames((current) => {
        const updated = { ...current };
        let changed = false;

        for (const result of results) {
          if (result.status !== "fulfilled") {
            continue;
          }

          for (const game of result.value.games) {
            updated[`${result.value.league}-${game.id}`] = game;
            changed = true;
          }
        }

        return changed ? updated : current;
      });
    }

    refreshScores();

    const interval = setInterval(refreshScores, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bets]);

  useEffect(() => {
    if (Object.keys(liveGames).length === 0) {
      return;
    }

    setBets((current) => {
      let changed = false;

      const updated = current.map((bet) => {
        if (bet.status !== "active") {
          return bet;
        }

        let selectionsChanged = false;

        const selections = (bet.selections || []).map((selection) => {
          if (selection.finalGame) {
            return selection;
          }

          const game = liveGames[getGameKey(selection)];

          if (!isGameFinal(game)) {
            return selection;
          }

          const awayScore = getScore(game.awayTeam);
          const homeScore = getScore(game.homeTeam);

          if (awayScore === null || homeScore === null) {
            return selection;
          }

          selectionsChanged = true;

          return {
            ...selection,
            finalGame: createFinalGame(game),
            finalResult: gradeSelection(selection, game),
          };
        });

        const updatedBet = selectionsChanged
          ? { ...bet, selections }
          : bet;

        const result = getBetResult(updatedBet, liveGames);

        if (result && result !== "review") {
          changed = true;

          return {
            ...updatedBet,
            status: "closed",
            result,
            settledAt: new Date().toISOString(),
          };
        }

        if (selectionsChanged) {
          changed = true;
          return updatedBet;
        }

        return bet;
      });

      return changed ? updated : current;
    });
  }, [liveGames]);

  function saveBet(bet) {
    setBets((current) => [bet, ...current]);
    setActiveTab("active");
    setShowAddBet(false);
  }

  function deleteBet(betId) {
    setBets((current) =>
      current.filter((bet) => bet.id !== betId)
    );
  }

  const visibleBets = bets
    .filter((bet) => bet.status === activeTab)
    .filter((bet) => betFilter === "all" || bet.type === betFilter)
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === "league") {
        return (a.selections[0]?.league || "").localeCompare(
          b.selections[0]?.league || ""
        );
      }

      if (sortBy === "upcoming") {
        return (
          new Date(a.selections[0]?.gameDate) -
          new Date(b.selections[0]?.gameDate)
        );
      }

      if (sortBy === "live") {
        const getPriority = (bet) => {
          const states = (bet.selections || []).map(
            (selection) =>
              getGameState(
                selection.finalGame ||
                liveGames[getGameKey(selection)]
              )
          );

          if (states.includes("in")) {
            return 0;
          }

          if (states.includes("pre")) {
            return 1;
          }

          return 2;
        };

        return getPriority(a) - getPriority(b);
      }

      return 0;
    });

  return (
    <main className="cfb-games-page">
      <SportsNav />

      {loading ? (
        <LoadingSpinner message="Loading SweatZone..." />
      ) : showAddBet ? (
        <AddBet
          onBack={() => setShowAddBet(false)}
          onSaveBet={saveBet}
        />
      ) : (
        <>
          <h1>SweatZone</h1>

          <div className="sweatzone-header">
            <p>Your live bet tracker</p>

            <button
              className="sweatzone-add-button"
              type="button"
              onClick={() => setShowAddBet(true)}
            >
              + Add Bet
            </button>
          </div>

          <div className="game-tabs">
            <button
              className={activeTab === "active" ? "active" : ""}
              onClick={() => setActiveTab("active")}
            >
              Active Bets
            </button>

            <button
              className={activeTab === "closed" ? "active" : ""}
              onClick={() => setActiveTab("closed")}
            >
              Closed Bets
            </button>
          </div>

          <div className="sweatzone-filters">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="recent">Recently Added</option>
              <option value="live">Live First</option>
              <option value="upcoming">Starting Soon</option>
              <option value="league">By League</option>
            </select>

            <select
              value={betFilter}
              onChange={(event) => setBetFilter(event.target.value)}
            >
              <option value="all">All Bets</option>
              <option value="straight">Straight Bets</option>
              <option value="parlay">Parlays</option>
            </select>
          </div>

          {visibleBets.length === 0 ? (
            <div className="sweatzone-empty">
              <h2>
                {activeTab === "active"
                  ? "No Active Bets"
                  : "No Closed Bets"}
              </h2>

              <p>
                {activeTab === "active"
                  ? "Add your first bet to start tracking."
                  : "Your completed bets will appear here."}
              </p>
            </div>
          ) : (
            <div className="sweatzone-saved-bets">
              {visibleBets.map((bet, index) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  liveGames={liveGames}
                  defaultExpanded={index === 0}
                  onDelete={deleteBet}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}