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
      <div key={label}>
        <strong>{label}</strong>{" "}

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

        <span> {leader.value}</span>
      </div>
    );
  }

  return (
    <section>
      <h2>Team Leaders</h2>

      <h3>Batting</h3>
      {batting.map(({ label, leader }) =>
        renderLeader(label, leader)
      )}

      <h3>Pitching</h3>
      {pitching.map(({ label, leader }) =>
        renderLeader(label, leader)
      )}
    </section>
  );
}