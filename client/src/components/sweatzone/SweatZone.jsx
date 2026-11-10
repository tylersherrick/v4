
import { useEffect, useState } from "react";
import SportsNav from "../home/SportsNav.jsx";
import AddBet from "./AddBet.jsx";
import BetCard from "./BetCard.jsx";
import "../../styles/sweatzone.css";

const STORAGE_KEY = "sweatzone-bets";

function loadBets() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export default function SweatZone() {
  const [activeTab, setActiveTab] = useState("active");
  const [sortBy, setSortBy] = useState("recent");
  const [betFilter, setBetFilter] = useState("all");
  const [showAddBet, setShowAddBet] = useState(false);
  const [bets, setBets] = useState(loadBets);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
  }, [bets]);

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

      return 0;
    });

  return (
    <main className="cfb-games-page">
      <SportsNav />

      {showAddBet ? (
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
