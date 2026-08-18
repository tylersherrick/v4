import { Link } from "react-router-dom";

export default function MLBTeamLeaders({ leaders }) {
  if (!leaders) {
    return null;
  }

  const batting = [
    {
      label: "AVG",
      leader: leaders.batting?.average,
    },
    {
      label: "HR",
      leader: leaders.batting?.homeRuns,
    },
    {
      label: "RBI",
      leader: leaders.batting?.rbi,
    },
  ];

  const pitching = [
    {
      label: "Wins",
      leader: leaders.pitching?.wins,
    },
    {
      label: "ERA",
      leader: leaders.pitching?.era,
    },
    {
      label: "Strikeouts",
      leader: leaders.pitching?.strikeouts,
    },
  ];

  function renderLeader(label, leader) {
    if (!leader) {
      return null;
    }

    return (
      <div
        key={label}
        className="mlb-team-leader"
      >
        <span className="mlb-team-leader-stat">
          {label}
        </span>

        <div className="mlb-team-leader-player">
          {leader.espnPlayerId ? (
            <Link
              to={`/mlb/player/${leader.espnPlayerId}`}
              state={{
                playerName: leader.name,
              }}
            >
              {leader.name}
            </Link>
          ) : (
            <span>{leader.name}</span>
          )}

          <span className="mlb-team-leader-value">
            {leader.value}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="mlb-team-leaders-section">
      <h2>Team Leaders</h2>

      <div className="mlb-team-leaders-group">
        <h3>Batting</h3>

        <div className="mlb-team-leaders-list">
          {batting.map(({ label, leader }) =>
            renderLeader(label, leader)
          )}
        </div>
      </div>

      <div className="mlb-team-leaders-group">
        <h3>Pitching</h3>

        <div className="mlb-team-leaders-list">
          {pitching.map(({ label, leader }) =>
            renderLeader(label, leader)
          )}
        </div>
      </div>
    </section>
  );
}