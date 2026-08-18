import { Link } from "react-router-dom";
import { useState } from "react";

export default function MLBPitchers({ awayTeam, homeTeam, gameState }) {
  const isPregame = gameState === "pre";
  const [expandedTeam, setExpandedTeam] = useState(null);

  function toggleTeam(teamId) {
    setExpandedTeam((current) =>
      current === teamId ? null : teamId
    );
  }

  function renderTeamPitchers(team) {
    if (isPregame) {
      if (!team.probablePitcher) {
        return (
          <p className="mlb-pitcher-empty">
            No probable pitcher available.
          </p>
        );
      }

      const isExpanded =
        expandedTeam === team.id;

      return (
        <div className="mlb-pitcher">
          <button
            className="mlb-pitcher-toggle"
            onClick={() => toggleTeam(team.id)}
          >
            <div className="mlb-pitcher-main">
              <Link
                to={`/mlb/player/${team.probablePitcher.id}`}
                state={{
                  playerName: team.probablePitcher.name,
                  position: team.probablePitcher.position,
                }}
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                {team.probablePitcher.name}
              </Link>

              {team.probablePitcher.record && (
                <span className="mlb-pitcher-record">
                  {team.probablePitcher.record}
                </span>
              )}
            </div>

            <span className="mlb-pitcher-arrow">
              {isExpanded ? "▲" : "▼"}
            </span>
          </button>

          {isExpanded && (
            <div className="mlb-pitcher-expanded">
              <p>Probable Starter</p>
            </div>
          )}
        </div>
      );
    }

    if (!team.pitchers?.length) {
      return (
        <p className="mlb-pitcher-empty">
          No pitching data available.
        </p>
      );
    }

    return (
      <div className="mlb-pitcher-list">
        {team.pitchers.map((pitcher) => {
          const isExpanded =
            expandedTeam === `${team.id}-${pitcher.id}`;

          return (
            <div
              className="mlb-pitcher"
              key={pitcher.id}
            >
              <button
                className="mlb-pitcher-toggle"
                onClick={() =>
                  toggleTeam(`${team.id}-${pitcher.id}`)
                }
              >
                <div className="mlb-pitcher-main">
                  <Link
                    to={`/mlb/player/${pitcher.id}`}
                    state={{
                      playerName: pitcher.name,
                      position: pitcher.position,
                    }}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {pitcher.name}
                  </Link>

                  {pitcher.starter && (
                    <span className="mlb-pitcher-role">
                      SP
                    </span>
                  )}
                </div>

                <span className="mlb-pitcher-arrow">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {isExpanded &&
                Object.keys(pitcher.stats || {}).length > 0 && (
                  <div className="mlb-pitcher-stats">
                    {Object.entries(
                      pitcher.stats || {}
                    ).map(([label, value]) => (
                      <span key={label}>
                        {label}: {value}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="mlb-pitchers-section">
      <h2>
        {isPregame ? "Probable Pitchers" : "Pitchers"}
      </h2>

      <div className="mlb-pitchers-grid">
        <div className="mlb-pitcher-team">
          <h3>{awayTeam.name}</h3>
          {renderTeamPitchers(awayTeam)}
        </div>

        <div className="mlb-pitcher-team">
          <h3>{homeTeam.name}</h3>
          {renderTeamPitchers(homeTeam)}
        </div>
      </div>
    </section>
  );
}