import { Link } from "react-router-dom";
import { useState } from "react";

export default function MLBGameBatting({
  awayTeam,
  homeTeam,
}) {
  const [selectedTeam, setSelectedTeam] = useState("away");
  const [selectedStats, setSelectedStats] = useState("batting");

  const team =
    selectedTeam === "away"
      ? awayTeam
      : homeTeam;

  function switchTeam(team) {
    setSelectedTeam(team);
    setSelectedStats("batting");
  }

  function renderBatters() {
    if (!team.batters?.length) {
      return (
        <p className="mlb-team-stats-empty">
          No batting stats available.
        </p>
      );
    }

    return (
      <div className="mlb-batting-list">
        {team.batters.map((player) => (
          <div
            className="mlb-batter"
            key={player.id}
          >
            <div className="mlb-batter-header">
              <Link
                to={`/mlb/player/${player.id}`}
                state={{
                  playerName: player.name,
                  position: player.position,
                }}
              >
                {player.name}
              </Link>

              {player.position && (
                <span>{player.position}</span>
              )}
            </div>

            <div className="mlb-batter-stats">
              {Object.entries(
                player.stats || {}
              ).map(([label, value]) => (
                <span key={label}>
                  {label}: {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderPitchers() {
    if (!team.pitchers?.length) {
      return (
        <p className="mlb-team-stats-empty">
          No pitching stats available.
        </p>
      );
    }

    return (
      <div className="mlb-pitching-list">
        {team.pitchers.map((pitcher) => (
          <div
            className="mlb-game-pitcher"
            key={pitcher.id}
          >
            <div className="mlb-game-pitcher-header">
              <Link
                to={`/mlb/player/${pitcher.id}`}
                state={{
                  playerName: pitcher.name,
                  position: pitcher.position,
                }}
              >
                {pitcher.name}
              </Link>

              {pitcher.starter && (
                <span>SP</span>
              )}
            </div>

            <div className="mlb-game-pitcher-stats">
              {Object.entries(
                pitcher.stats || {}
              ).map(([label, value]) => (
                <span key={label}>
                  {label}: {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mlb-team-stats-section">
      <h2>Game Stats</h2>

      <div className="mlb-team-selector">
        <button
          className={
            selectedTeam === "away"
              ? "active"
              : ""
          }
          onClick={() => switchTeam("away")}
        >
          {awayTeam.abbreviation}
        </button>

        <button
          className={
            selectedTeam === "home"
              ? "active"
              : ""
          }
          onClick={() => switchTeam("home")}
        >
          {homeTeam.abbreviation}
        </button>
      </div>

      <div className="mlb-stats-type-selector">
        <button
          className={
            selectedStats === "batting"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedStats("batting")
          }
        >
          Batting
        </button>

        <button
          className={
            selectedStats === "pitching"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedStats("pitching")
          }
        >
          Pitching
        </button>
      </div>

      <div className="mlb-selected-team">
        <h3>{team.name}</h3>

        {selectedStats === "batting"
          ? renderBatters()
          : renderPitchers()}
      </div>
    </section>
  );
}